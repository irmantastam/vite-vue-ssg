<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onServerPrefetch, onMounted } from 'vue'

const getPlantsLocal = () => {
  if (import.meta.env.SSR) {
    return
  }

  const plantsDataJson = document.querySelector('#plants-data')?.dataset?.json
  const plantsDataJsonParsed = plantsDataJson && JSON.parse(plantsDataJson)

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
  if (!plants.value) {
    plants.value = getPlantsLocal() || (await fetchPlants())
  }
})
</script>

<template>
  <header>
    <div class="header-content">
      <div>
        <h1>House Plant Tracker</h1>
        <p class="subtitle">Monitor the happiness of your house plants!</p>
      </div>
      <nav>
        <RouterLink class="nav-link" to="/">Home</RouterLink>
        <RouterLink class="nav-link" to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView :plants="plants" />
  <footer>
    <div class="footer-content">
      <img alt="Contentful logo" class="logo" src="./assets/logo.svg" width="50" height="125" />
      <p>
        Created with <a href="https://www.contentful.com/" target="_blank">Contentful</a> and
        <a href="https://vuejs.org/" target="_blank">Vue.js</a>.
      </p>
    </div>
    <div class="credit">
      Images from
      <a
        href="https://unsplash.com/@feeypflanzen?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >feey</a
      >,
      <a
        href="https://unsplash.com/@parkerdesignsss?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >Parker Sturdivant</a
      >,
      <a
        href="https://unsplash.com/@nataliekinnear?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >Natalie Kinnear</a
      >,
      <a
        href="https://unsplash.com/@cortes?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >Dennis Cortés</a
      >,
      <a
        href="https://unsplash.com/@marcblue?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >Marc Blue</a
      >, and
      <a
        href="https://unsplash.com/@karaeads?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >Kara Eads</a
      >
      on
      <a
        href="https://unsplash.com/photos/green-plant-on-brown-woven-basket-2LlRY-bMmig?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >Unsplash</a
      >.
    </div>
  </footer>
  <component
    :is="'script'"
    id="plants-data"
    type="text/plain"
    :data-json="JSON.stringify(plants)"
  />
</template>

<style scoped>
header {
  background-color: white;
  padding: 2rem;
}

.header-content {
  max-width: 1280px;
  margin: auto;
}

.subtitle {
  font-size: 21px;
}

.nav-link {
  color: #2d4a2f;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #2d4a2f;
  margin: 1rem 1rem 1rem 0;
  display: inline-block;
  text-transform: uppercase;
}

.router-link-active {
  background-color: #2d4a2f;
  color: white;
}

footer {
  color: white;
  font-size: 20px;
  font-family: sans-serif;
  padding: 20px;
  background-image: url(/plant-background.jpg);
  background-size: cover;
  background-position: right;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: auto;
}

.footer-content a {
  color: white;
}

.credit {
  text-align: center;
  font-size: 15px;
}

.credit a {
  color: lightgray;
}

@media screen and (min-width: 992px) {
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .nav-link {
    margin: 0 0.5rem;
  }
}
</style>
