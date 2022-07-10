    
<template> 
  <div 
    id='Loading' 
    v-if="!isRendered"
  >
    <h1 style="font-size: 48px; margin-bottom: 24px">Loading images...</h1>
    <div>
    <img
      :src="imageURL1"
      alt=""
      width="300"
      class='imageDuringLoading' 
    />
    <img
      :src="imageURL2"
      alt=""
      width="300"
      class='imageDuringLoading' 
    />
    <img
      :src="imageURL3"
      alt=""
      width="300"
      class='imageDuringLoading' 
    />
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingScreen',
  props: [
    "isRendered"
  ],
  created() {
    console.log(this.isRendered)
    this.imageURL1 = "https://florafungus.s3.ap-southeast-1.amazonaws.com/_FUNGUS-final-" + 0.9666962439659983 + ".jpg"
    this.imageURL2 = "https://florafungus.s3.ap-southeast-1.amazonaws.com/_FUNGUS-final-" + 0.7846196936443448 + ".jpg"
    this.imageURL3 = "https://florafungus.s3.ap-southeast-1.amazonaws.com/_FUNGUS-final-" + 0.9500540134031326 + ".jpg"
  },
}
</script>

<style scoped>
  .imageDuringLoading {
    padding: 8px;
    border-radius: 50%;
  }

  #Loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>