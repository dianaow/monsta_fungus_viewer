<template>
  <div class="toolbar">
    <div class='panel panel-1'>
      <p class='label'>FILTER BY:</p>
      <div class='btnGroup'>
        <p class='btnLabel'>BACKGROUND</p>
        <button
          v-for="(item, index) in bgcolors"
          type="button"
          :class="[
            'btn-graph',
            selectedSubject['background color'] === item ? 'btn-graph-selected' : null
          ]"
          :style="{'background-color':item, 'color': item === '#000000' ? '#ffffff': null}"
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
          :style="{'background-color':item}"
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
          :style="{'background-color':item}"
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
            selectedSort === item ? 'btn-graph-selected' : null
          ]"
          @click="setSelectedSort(item)"
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
      </div>
    </div>
  </div>
  <div>
  <div>
    <p class='label-other'>Vote for your favourite images by clicking on them! View public vote results by clicking on sort by 'votes' button.</p>
    <p class='label-other'>Right click on each image to open URL with image in full size</p>
  </div>
  </div>
</template>

<script>
export default {
  name: 'ControlPanel',
  emits: [
    "select-subject",
    "select-sort",
    "zoom-level"
  ], 
  props: [
    "animating",
  ],
  data() {
    return {
      colors: ['All', '#F4E560', '#EE6D67', '#F74633', '#F4454F', '#3158D1', '#269574', '#2A7CA1', '#D2C4C2', '#ffffff', '#F8A621'],
      bgcolors: ['All', '#DFCEBE', '#F74633', '#F4454F', '#3158D1', '#2A7CA1', '#D2C4C2', '#F8A621', '#000000'],
      shapeType: ['All', 'all_circles', 'all_hexagons', 'blob', 'petal2', 'mixed', 'hexagons_circles'],
      extraStyleType: ['All', 'gradient path', 'dbl node color 1', 'dbl node color 2'],
      fillType: ['All', 'all_filled', 'mixed', 'all_transparent'],
      connectionType: ['All', "1", "2", "3"],
      levels: ["All", 3, 4, 5, 6, 7, 8],
      sortCategories: ['id', 'background color', 'element color', 'shapeType', 'votes'],
      selectedSubject: {'background color': "All", 'element color': "All", 'link color': "All", 'shapeType': "All", 'levels': "All", "fillType": "All", "connectedness": "All", "extra style": "All"},
      selectedSort: 'id',
      zoomLevel: 1
    }
  },
  methods: {
    setSelectedSubject(key, value) {
      if(this.animating) return
      this.selGroup = key
      this.selectedSubject = {...this.selectedSubject, [key] : value};
      this.$emit("select-subject", {selectedSubject: this.selectedSubject, selGroup: this.selGroup})
    },
    setSelectedSort(key) {
      if(this.animating) return
      this.selectedSort = key
      this.$emit("select-sort", this.selectedSort);
    },
    zoomHandler(zoomIn) {
      if(this.animating) return
      if(zoomIn) {
        this.zoomLevel += 1
      } else {
        this.zoomLevel -= 1
      }
      this.$emit("zoom-level", this.zoomLevel);
    }
  }
}
</script>

<style scoped>

.toolbar {
  display: flex;
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

.label-other {
  font-size: 11px; 
  font-weight: bold; 
  text-align: center;
  padding: 0px;
  margin: 4px
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
  width: 32px;
  height: 32px;
}

.btn-graph img {
  width: 24px;
  height: 24px;
}

</style>