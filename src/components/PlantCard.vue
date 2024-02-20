<script setup>
defineProps({
  plant: {
    type: Object,
    required: true
  }
})

function getNumberOfDays(end) {
  const today = new Date()
  const lastWatered = new Date(end)

  const day = 1000 * 60 * 60 * 24

  const dateDifference = lastWatered.getTime() - today.getTime()

  const daysDifference = Math.round(dateDifference / day) * -1

  if (daysDifference < 7) {
    return '🥰 I am happy!'
  } else if (daysDifference >= 7 && daysDifference < 30) {
    return '⏰ Water me soon!'
  } else if (daysDifference > 30) {
    return '🚨 Please water me!'
  }
}
</script>
<template>
  <div class="plant">
    <img
      :src="`${plant.image.url}?f=center&fit=fill&w=300&h=300`"
      :alt="plant.image.description"
      width="300"
      height="300"
    />
    <div class="plant-content">
      <div class="plant-header">
        <div class="plant-title">
          <h2 class="plant-name">{{ plant.commonName }}</h2>
          <p class="scientific-name">{{ plant.scientificName }}</p>
          <p class="sunlight">🌤️ {{ plant.sunlight }}</p>
          <p class="water-instructions">💧 {{ plant.wateringSchedule }}</p>
          <p class="happiness-status" v-if="plant.happiness">💚 Happy plant</p>
          <p class="happiness-status" v-else>💔 Sad plant</p>
        </div>
      </div>
      <p class="water-alert">{{ getNumberOfDays(plant.lastWatered) }}</p>
    </div>
  </div>
</template>

<style scoped>
.plant img {
  border-bottom: 1px solid #2d4a2f;
}
.plant-header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
}

.scientific-name {
  font-style: italic;
}

.water-alert {
  border: 1px solid #2d4a2f;
  padding: 5px;
  display: inline-block;
  margin-top: 5px;
  position: absolute;
  top: -17px;
  background-color: white;
  color: #2d4a2f;
  right: 15px;
}
</style>
