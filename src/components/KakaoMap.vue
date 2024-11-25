<template>
  <div>
    <div id="map" style="width:100%;height:600px;"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  if (window.kakao && window.kakao.maps) {
    initMap();
  } else {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false`;
    script.addEventListener('load', () => {
      window.kakao.maps.load(initMap);
    });
    document.head.appendChild(script);
  }
});

const initMap = () => {
  const container = document.getElementById('map');
  const options = {
    center: new window.kakao.maps.LatLng(35.1796, 129.0756), // 부산 중심 좌표
    level: 3
  };
  new window.kakao.maps.Map(container, options);
};
</script>