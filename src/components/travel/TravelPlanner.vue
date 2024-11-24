<template>
  <div class="map_wrap">
    <div id="map"></div>
  </div>
</template>

<script>
export default {
  name: 'TravelPlanner',

  data() {
    return {
      map: null,
    };
  },

  async mounted() {
    await this.initializeMap();
  },

  methods: {
    initializeMap() {
      return new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
          this.initMap();
          resolve();
        } else {
          const script = document.createElement('script');
          script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=f6c418eb4436b545e5fdb79fe4c4e71e&autoload=false`;
          script.onload = () => {
            window.kakao.maps.load(() => {
              this.initMap();
              resolve();
            });
          };
          document.head.appendChild(script);
        }
      });
    },

    initMap() {
      const container = document.getElementById('map');
      const options = {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
      };
      this.map = new window.kakao.maps.Map(container, options);
    },
  },
};
</script>

<style scoped>
.map_wrap {
  width: 100%;
  height: 100vh;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
