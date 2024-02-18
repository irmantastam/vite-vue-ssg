<script setup>
import PlantCard from '../components/PlantCard.vue'
import { ref, onServerPrefetch, onMounted } from 'vue'

const getPlantsLocal = () => {
  if (import.meta.env.SSR) {
    return
  }

  const plantsDataJson = document.querySelector('#plants-data')?.dataset?.json
  const plantsDataJsonParsed = plantsDataJson && JSON.parse(plantsDataJson)

  console.log('Trying to get plants. Plants local is: ', plantsDataJsonParsed)

  return plantsDataJsonParsed
}

const plants = ref(getPlantsLocal())

const fetchPlants = async () => {
  try {
    const plants = await fetch(import.meta.env.VITE_ROOT + '/api/plants').then((response) =>
      response.json()
    )
    return plants
  } catch (error) {
    throw new Error('Could not receive the data from API\n' + error)
  }
}

onServerPrefetch(async () => {
  plants.value = await fetchPlants()
})

onMounted(async () => {
  console.log('plants.value onMounted', plants.value)
  if (!plants.value) {
    plants.value = getPlantsLocal() || (await fetchPlants())
  }
})
</script>

<template>
  <main>
    <ul v-if="plants" class="plants">
      <li v-for="plant in plants" :key="plant.sys.id" class="plant-container">
        <PlantCard :plant="plant" />
      </li>
    </ul>
  </main>
  <component
    :is="'script'"
    id="plants-data"
    type="text/plain"
    :data-json="JSON.stringify(plants)"
  />
</template>

<style scoped>
main {
  background-color: white;
  min-height: 100vh;
}
.plants {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: auto;
  max-width: 1280px;
}

.plant-container {
  margin: 10px auto 40px auto;
  border: 1px solid #2d4a2f;
  outline: 2px solid white;
  box-shadow: 3px 3px 0 #2d4a2f;
  position: relative;
}

@media screen and (min-width: 992px) {
  .plants {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
