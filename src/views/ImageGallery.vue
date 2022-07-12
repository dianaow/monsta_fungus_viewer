<template>
  <h1 style="text-align:center; margin-bottom: 0px; letter-spacing: .2rem;">MONSTA FUNGUS</h1>
  <control-panel
    :animating="animating"
    @select-subject="handleSubjSelect"
    @select-sort="handleSortSelect"
    @zoom-level="handleZoom"
  />
  <loading-screen 
    :isRendered="isRendered"
  />
  <div class="gallery">
    <canvas id="mycanvas"></canvas>
  </div>
</template>

<script>
import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { Simple } from "pixi-cull"
import { Scrollbox } from 'pixi-scrollbox'
import ControlPanel from "../components/ControlPanel.vue";
import LoadingScreen from "../components/LoadingScreen.vue";
import spritesheetJSON from '../data/spritesheet.json'
import response from "../data/fungus_meta.json"

export default {
  components: {
    ControlPanel,
    LoadingScreen
  },
  data() {
    return {
      dataFetched: false,
      data: [],
      width: window.innerWidth,
      height: window.innerHeight,
      zoomLevel: 1,
      debugMode: false,
      animating: false,
      timeout: false,
      isRendered: false, // flag to check if pixijs elements have all been rendered and visible on screen,
      colors : ['All', '#F9AD6E', '#EE6D67', '#F74633', '#F4454F', '#3158D1', '#269574', '#2A7CA1', '#D2C4C2', '#ffffff', '#F8A621'],
      shapeType: ['All', 'all_circles', 'all_hexagons', 'petal1', 'petal3', 'circles_squares', 'hexagons_circles'],
    };
  },
  computed: {
    isDataReady() {
      return this.data.length !== 0;
    },
  },
  watch: {
    isDataReady() {
    this.nodes = this.getElementPositions(this.data);
    this.renderElements()
    }
  },
  methods: {
    setupData(response) {
      this.data = response
      .slice(1)
      .map((d) => {
        return d;
      });
    },
    async getVotes(nodes) {
      let response = await fetch(`/api/votes`)
      let votesData = await response.json()
      nodes.forEach(d=>{
        let votes = votesData.filter(el=>el.seed === d.id.toString())
        d.votes = votes.length || 0
      })
    },
    fetchData() {
      this.dataFetched = true;
      this.setupData(response)
      // fetch(
      //  "./src/data/fungus_meta.json"
      // )
      //   .then((response) => response.json())
      //   .then((response) => {
      //     this.setupData(response);   
      //   });
    },
    handleZoom(value){
      this.zoomLevel = value
      if(this.zoomLevel > (this.width <= 1500 ? 4 : 2) || this.zoomLevel <= 0) return
      this.updateElements()
    },
    handleSubjSelect(options) {
      this.selectedSubject = options.selectedSubject;
      this.selGroup = options.selGroup;
      this.updateElements()
    },
    handleSortSelect(value) {
      this.selectedSort = value;
      this.updateElements()
    },   
    handleResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.updateElements()
    },
    handleImgClick(id) {
      if(this.animating) return
      let sprite = this.spritesArr.find(d=>d.name.includes(id))
      window.open("https://florafungus.s3.ap-southeast-1.amazonaws.com/" + sprite.name + ".jpg");
    },
    async handleImgDblClick(id, sprite) {
      if(this.animating) return
      sprite.alpha = 0.5
      await fetch('/api/add_vote', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({timestamp: new Date(), timezone: new Date().getTimezoneOffset(), seed: id})
      });
    },
    getElementPositions(data) {
      let padding = 0
      let size = (this.width <= 1500 ? 64 : 126) * this.zoomLevel
      let imgsPerRow = Math.floor(this.width / size)
      let newData = []
      let rowNumber = 0
      data.forEach((d,i)=>{
         rowNumber = Math.floor(i / imgsPerRow)
         newData.push({
           ...d, 
          width : size - padding,
          height : size - padding,
          x : ((i % imgsPerRow) * size),
          y : (rowNumber * size) 
         })
      })
      return newData
    },
    extractSpriteTexture(texture, sprite) {
      const frame = new PIXI.Rectangle(
        sprite.position.x,
        sprite.position.y,
        sprite.dimension.w,
        sprite.dimension.h
      );
      const orig = new PIXI.Rectangle(
        0,
        0,
        sprite.dimension.w,
        sprite.dimension.h
      );
      return new PIXI.Texture(texture, frame, orig, false, false);
    },
    async loadTextures() {
      this.spritesArr = []
      const textures = new Map()
      const baseTextures = []
      const baseUrl = 'https://florafungus.s3.ap-southeast-1.amazonaws.com/spritesheets/'
      //const response = await fetch('./src/data/sprites/spritesheet.json')
      //const spritesheetJSON = await response.json()
      for(const sprites of spritesheetJSON.spritesheets){
        const baseTexture = await this.loadTexture(baseUrl + sprites.image);
        baseTextures.push(baseTexture)
        for(const spritedata of sprites.sprites){
          this.spritesArr.push(spritedata)
          const texture = this.extractSpriteTexture(baseTexture, spritedata)
          textures.set(spritedata.name.replace( /^\D+/g, ''), texture)
        }
      }
      return textures
    },
    loadImage(url){
      return new Promise((resolve, reject) => {
        const image = new Image;
        image.crossOrigin = "Anonymous";
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = reject;
      });
    },
    async loadTexture(url){
      const image = await this.loadImage(url);
      return PIXI.BaseTexture.from(image);
    },
    makeSprite(texture, nodeData){
      const sprite = texture ? new PIXI.Sprite(texture) : new PIXI.Sprite(PIXI.Texture.WHITE);
      //sprite.tint = 0xff0000
      sprite.name = nodeData.id
      //sprite.anchor.set(0.5)
      sprite.x = nodeData.x
      sprite.y = nodeData.y
      sprite.width = nodeData.width
      sprite.height= nodeData.height
      sprite.interactive = true;
      sprite.buttonMode = true;
      return sprite
    },
    renderElements() {
      const that = this
      const canvas = document.getElementById('mycanvas')
      
      // create PIXI application
      const app = new PIXI.Application({
        view: canvas,
        width: this.width,
        height: this.height,
        resolution: 2,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true
      }) 
      
      // create the scrollbox
      this.scrollbox = new Scrollbox({ boxWidth: this.width, boxHeight: this.height })

      // create PIXI viewport
      this.viewport = new Viewport({
        screenWidth: this.width,
        screenHeight: this.height,
        worldWidth: this.width,
        worldHeight: this.height,
        interaction: app.renderer.plugins.interaction
      });
      app.stage.addChild(this.viewport);
      app.stage.addChild(this.scrollbox);
      
      //this.viewport.pinch().wheel().decelerate().clampZoom({minScale: 1, maxScale: 3});
      this.viewport.setZoom(this.zoomLevel) //set initial zoom level

      const cull = new Simple() // new SpatialHash()
      cull.addList(this.viewport.children)
      cull.cull(this.viewport.getVisibleBounds())

      // this.viewport.on('zoomed-end', function(){
      //   if (that.viewport.dirty) {
      //     if(this.animating) return
      //     that.zoomLevel = that.viewport.scale.x;
      //     cull.cull(that.viewport.getVisibleBounds())
      //     that.viewport.dirty = false;
      //   }
      // });
 
      that.imagesLayer = new PIXI.Container();
      this.viewport.addChild(that.imagesLayer);
      this.scrollbox.content.addChild(that.imagesLayer)

      new Promise((resolve) => {
        resolve('loading textures');
      })
      .then(function(){
          return that.debugMode ? null : that.loadTextures() 
      })
      .then(async function(textures){
        //console.log('creating sprites', textures)
        that.nodes.forEach((nodeData) => {
          let texture = textures ? textures.get(nodeData.id.toString()) : PIXI.Texture.WHITE
          const sprite = that.makeSprite(texture, nodeData);
          sprite.on('rightdown', () => that.handleImgClick(nodeData.id.toString())); 
          sprite.on('click', () => that.handleImgDblClick(nodeData.id.toString(), sprite)); 
          that.imagesLayer.addChild(sprite)
        })
      })
      .then(function(){
        //console.log('rendered sprites')
        app.renderer.on('postrender', function(){
          if(that.isRendered) return //postrender function runs infinitely, add this flag to only run it once 
          that.isRendered = true // all pixijs elements have been rendered and are visible on screen
        })
      })
      .catch(err => { console.log(err) });  
    },
    animate(delta, ticker) {
      let steps = 20
      this.tick += 1

      //actions to take after animation is completed
      if(this.tick > steps) {
        this.animating = false 
        ticker.stop()
        this.scrollbox.update()
        return 
      }

      this.origNodesCopy.forEach(n=>{
        if(!n.sprite) return
        //n.sprite.position.x = n.x
        //n.sprite.position.y = n.y
        n.sprite.position.x -= n.xDist/steps
        n.sprite.position.y -= n.yDist/steps
        n.sprite.width -= n.widthIncAmt/steps
        n.sprite.height -= n.heightIncAmt/steps
      })
    },
    calculateNewAttrsThenMove(filteredNodes){
      let that = this

      const prevSimulatedFilteredNodes = this.simulatedFilteredNodes || []
      this.simulatedFilteredNodes = this.getElementPositions(filteredNodes) //run new simulation only on nodes with matching subject label

      this.origNodesCopy.forEach(n=>{
        //calculate distance in each direction to move by
        let newCoords = this.simulatedFilteredNodes.find(d=>d.id === n.id) 
        let prevCoords = prevSimulatedFilteredNodes.find(d=>d.id === n.id) //identify if node has been previously moved one step before
        n.xDist = (prevCoords ? prevCoords.x : n.x) - (newCoords ? newCoords.x : n.x)
        n.yDist = (prevCoords ? prevCoords.y : n.y) - (newCoords ? newCoords.y : n.y)
        //calculate amount of pixels for both width and height to increment by
        n.widthIncAmt = (prevCoords ? prevCoords.width : n.width) - (newCoords ? newCoords.width : n.width)
        n.heightIncAmt = (prevCoords ? prevCoords.height : n.height) - (newCoords ? newCoords.height : n.height)
        n.sprite = this.imagesLayer.getChildByName(n.id) //retrieve the sprite
        if(newCoords){
          if (n.sprite) n.sprite.visible = true
        } else {
          if (n.sprite) n.sprite.visible = false
        }
      })

      let T = new PIXI.Ticker()
      T.add((delta) => that.animate(delta, T));
      T.start()

    },
    updateElements(){
      this.animating = true
      this.tick = 0
      let that = this

      this.origNodesCopy = [...this.nodes]
      let filteredNodes = [...this.nodes]
      for (const item in this.selectedSubject) {
        filteredNodes = this.selectedSubject[item] === 'All' ? filteredNodes : filteredNodes.filter(d=>d[item] === this.selectedSubject[item])
      }
      
      if(this.selectedSort === 'votes'){
        new Promise((resolve) => {
          resolve('loading votes');
        })
        .then(async function(){
          await that.getVotes(filteredNodes)
        })
        .then(function(){ 
          filteredNodes = filteredNodes.filter(d=>d.votes > 0)
          filteredNodes.sort((a,b)=>{
            return b[that.selectedSort]-a[that.selectedSort]
          })
        })
         .then(function(){ 
          that.calculateNewAttrsThenMove(filteredNodes)
        })

      } else if(this.selectedSort === 'id'){
        filteredNodes.sort((a,b)=>{
          return a[this.selectedSort]-b[this.selectedSort]
        })
      } else {
        if(this.selectedSort === 'background color' || this.selectedSort === 'element color'){
          filteredNodes.sort((a,b)=>{
            return this.colors.indexOf(a[this.selectedSort])-this.colors.indexOf(b[this.selectedSort])
          })        
        } else if(this.selectedSort === 'shape') {
          filteredNodes.sort((a,b)=>{
            return this.shapeType.indexOf(a['shapeType'])-this.shapeType.indexOf(b['shapeType'])
          })               
        }
      }

      if(this.selectedSort !== 'votes') this.calculateNewAttrsThenMove(filteredNodes)

    }
  },
  created() {
    let that = this
    window.addEventListener('resize', function() {
      clearTimeout(that.timeout);
      that.timeout = setTimeout(that.handleResize, 350);
    });
    this.fetchData();
  },
  mounted() {
  },
  unmounted() {
    let that = this
    window.addEventListener('resize', function() {
      clearTimeout(that.timeout);
      that.timeout = setTimeout(that.handleResize, 350);
    });
  },
}

</script>