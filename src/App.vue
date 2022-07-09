<template>
  <ImageGallery/>
</template>

<script>
import ImageGallery from "./views/ImageGallery.vue"

export default {
  name: 'App',
  components: {
    ImageGallery
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000000;
}
</style>
