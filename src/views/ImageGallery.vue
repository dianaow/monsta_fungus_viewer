<template>
  <h3 style="text-align:center; margin-bottom: 0px;">MONSTA FUNGUS</h3>
  <div class="toolbar">
    <div class='panel panel-1'>
      <p class='label'>FILTER BY:</p>
      <div class='btnGroup'>
        <p class='btnLabel'>BACKGROUND</p>
        <button
          v-for="(item, index) in colors"
          type="button"
          :class="[
            'btn-graph',
            selectedSubject['background color'] === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSubject('background color', item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
      <div class='btnGroup'>
        <p class='btnLabel'>ELEMENT COLOR</p>
        <button
          v-for="(item, index) in colors"
          type="button"
          :class="[
            'btn-graph',
            selectedSubject['element color'] === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSubject('element color', item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
      <div class='btnGroup'>
        <p class='btnLabel'>LINK COLOR</p>
        <button
          v-for="(item, index) in colors"
          type="button"
          :class="[
            'btn-graph',
            selectedSubject['link color'] === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSubject('link color', item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
    </div>
    <div class='panel panel-2'>
      <p class='label'>FILTER BY:</p>
      <div class='btnGroup'>
        <p class='btnLabel'>SHAPE TYPE</p>
        <button
          v-for="(item, index) in shapeType"
          type="button"
          :class="[
            'btn-graph',
            selectedSubject['shapeType'] === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSubject('shapeType', item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
      <div class='btnGroup'>
        <p class='btnLabel'>FILL TYPE</p>
        <button
          v-for="(item, index) in fillType"
          :class="[
            'btn-graph',
            selectedSubject['fillType'] === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSubject('fillType', item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
      <div class='btnGroup'>
        <p class='btnLabel'>EXTRA STYLE</p>
        <button
          v-for="(item, index) in extraStyleType"
          type="button"
          :class="[
            'btn-graph',
            selectedSubject['extra style'] === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSubject('extra style', item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
    </div>
    <div class='panel panel-3'>
      <div class='btnGroup'>
        <p class='btnLabel'>FILTER BY: CONNECTION TYPE</p>
        <button
          v-for="(item, index) in connectionType"
          type="button"
          :class="[
            'btn-graph',
            selectedSubject['connectedness'] === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSubject('connectedness', item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
      <div class='btnGroup'>
        <p class='btnLabel'>FILTER BY: NUMBER OF LEVELS</p>
        <button
          v-for="(item, index) in levels"
          type="button"
          :class="[
            'btn-graph',
            selectedSubject['levels'] === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSubject('levels', item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
      <div class='btnGroup'>
        <p class='btnLabel'>SORT BY</p>
        <button
          v-for="(item, index) in sortCategories"
          type="button"
          :class="[
            'btn-graph',
            selSort === item ? 'btn-graph-selected' : null
          ]"
          @click="setSortSubject(item)"
          :key="index"
        >
          {{ item }}
        </button>
      </div>
      <div class='btnGroup'>
        <button
          type="button"
          class="btn-graph btn-zoom"
          @click="zoomHandler(true)"
          title="Zoom In"
        >
          <img src="@/assets/zoom-in.png" alt="zoomin" />
        </button>
        <button
          type="button"
          class="btn-graph btn-zoom"
          @click="zoomHandler(false)"
          title="Zoom Out"
        >
          <img src="@/assets/zoom-out.png" alt="zoomout" />
        </button>
        <p class='label' style='font-size: 12px; padding-top: 8px;'>Click on each image to see it in full size</p>
      </div>
    </div>
  </div>
  <div class="gallery">
    <canvas id="mycanvas"></canvas>
  </div>
</template>

<script>
import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { Simple } from "pixi-cull"
import { Scrollbox } from 'pixi-scrollbox'
import spritesheetJSON from '../data/spritesheet.json'
import response from "../data/fungus_meta.json"

export default {
  components: {

  },
  data() {
    return {
      colors : ['All', '#F9AD6E', '#EE6D67', '#F74633', '#F4454F', '#3158D1', '#269574', '#2A7CA1', '#D2C4C2', '#ffffff', '#F8A621'],
      shapeType: ['All', 'all_circles', 'all_hexagons', 'petal1', 'petal3', 'circles_squares', 'hexagons_circles'],
      extraStyleType: ['All', 'gradient path', 'nested node color 2', 'node color 2'],
      fillType: ['All', 'all_filled', 'mixed', 'all_transparent'],
      connectionType: ['All', 'barabasi_albert', 'low1', 'low2'],
      levels: ["All", 3, 4, 5, 6, 7, 8],
      //sortCategories: ['Seed Number', 'Background', 'Color', 'Shape'],
      sortCategories: ['id', 'background color', 'element color', 'shapeType'],
      dataFetched: false,
      data: [],
      selectedSubject: {'background color': "All", 'element color': "All", 'link color': "All", 'shapeType': "All", 'levels': "All", "fillType": "All", "connectedness": "All", "extra style": "All"},
      selSort: 'id',
      width: window.innerWidth,
      height: window.innerHeight,
      zoomLevel: 1,
      debugMode: false,
      animating: false,
      timeout: false
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
    }, 
    selectedSubject() {
      this.updateElements()
    },
    selSort() {
      this.updateElements()
    }
  },
  methods: {
    setupData(response) {
      this.data = response
      .slice(0,100)
      .map((d) => {
        return d;
      });
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
    setSelectedSubject(key, value) {
      if(this.animating) return
      this.selGroup = key
      this.selectedSubject = {...this.selectedSubject, [key] : value};
    },
    setSortSubject(key) {
      if(this.animating) return
      this.selSort = key
    },
    zoomHandler(zoomIn) {
      if(this.animating) return
      if(zoomIn) {
        this.zoomLevel += 1
      } else {
        this.zoomLevel -= 1
      }
      if(this.zoomLevel >= (this.width <= 1500 ? 5 : 3) || this.zoomLevel <= 0) return
      this.updateElements()
      //this.viewport.setZoom(this.zoomLevel)
      //this.viewport.animate({position: new PIXI.Point(0, 0), scaleX: 4, scaleY: 4, time: 1000})
    },
    handleResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.updateElements()
    },
    handleImgClick(id) {
      if(this.animating) return
      window.open("https://florafungus.s3.ap-southeast-1.amazonaws.com/_FUNGUS-" + id + ".jpg");
    },
    getElementPositions(data) {
      let padding = 0
      let size = (this.width <= 1500 ? 64 : 128) * this.zoomLevel
      let imgsPerRow = Math.floor(this.width / size)
      let newData = []
      data.forEach((d,i)=>{
         let rowNumber = Math.floor(i / imgsPerRow)
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
      const textures = new Map()
      const baseTextures = []
      const baseUrl = 'https://florafungus.s3.ap-southeast-1.amazonaws.com/spritesheets/'
      //const response = await fetch('./src/data/sprites/spritesheet.json')
      //const spritesheetJSON = await response.json()
      for(const sprites of spritesheetJSON.spritesheets){
        const baseTexture = await this.loadTexture(baseUrl + sprites.image);
        baseTextures.push(baseTexture)
        for(const spritedata of sprites.sprites){
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
      this.scrollbox = new Scrollbox({ boxWidth: this.width, boxHeight: this.height})

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
        console.log('creating sprites', textures)
        that.nodes.forEach((nodeData) => {
          let texture = textures ? textures.get(nodeData.id.toString()) : PIXI.Texture.WHITE
          const sprite = that.makeSprite(texture, nodeData);
          sprite.on('click', () => that.handleImgClick(nodeData.id.toString())); 
          that.imagesLayer.addChild(sprite)
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
    updateElements(){
      this.animating = true
      this.tick = 0
      let that = this

      this.origNodesCopy = [...this.nodes]
      let filteredNodes = [...this.nodes]
      for (const item in this.selectedSubject) {
        filteredNodes = this.selectedSubject[item] === 'All' ? filteredNodes : filteredNodes.filter(d=>d[item] === this.selectedSubject[item])
      }

      if(this.selSort === 'id'){
        filteredNodes.sort((a,b)=>{
          return a[this.selSort]-b[this.selSort]
        })
      } else {
          if(this.selSort === 'background color' || this.selSort === 'element color'){
            filteredNodes.sort((a,b)=>{
              return this.colors.indexOf(a[this.selSort])-this.colors.indexOf(b[this.selSort])
            })        
          } else if(this.selSort === 'shapeType') {
            filteredNodes.sort((a,b)=>{
              return this.shapeType.indexOf(a[this.selSort])-this.shapeType.indexOf(b[this.selSort])
            })               
          }
      }
  
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

<style>

.toolbar {
  display: flex;
  padding: 4px;
}

.panel {
  padding: 4px;
}

.panel-1 {
  width: 48%
}

.panel-2 {
  width: 27%
}

.panel-3 {
  width: 25%
}

.label {
  font-size: 11px; 
  font-weight: bold; 
  padding-left: 4px;
  margin: 0px
}

.btnGroup {
  display: flex;
  flex-wrap: wrap;
  margin: 0px;
  padding: 0px;
}

.btnLabel {
  font-size: 10px;
  margin: 0px;
  padding: 4px;
}

.btn-graph {
  display: block;
  outline: none;
  border: 1px solid #000000;
  border-radius: 5px;
  background-color: #ffffff;
  color: #000000;
  height: 24px;
  margin: 2px;
  padding: 4px;
  line-height: 1.1rem;
  cursor: pointer;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 10px;
}

.btn-graph:hover {
  background-color: #000000;
  border: 1px solid #ffffff;
  color: #ffffff;
}

.btn-graph-selected {
  background-color: #000000;
  border: 1px solid #ffffff;
  color: #ffffff;
}

.btn-zoom {
  background-color: #000000;
  border: 1px solid #ffffff;
  color: #ffffff;
  width: 28px;
  height: 28px;
}

.btn-graph img {
  width: 20px;
  height: 20px;
}

</style>
