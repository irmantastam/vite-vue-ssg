import process from 'node:process'
import 'dotenv/config'

export default async function handler(req, res) {
  const query = `{ 
    plantCollection {
      items {
        sys {
          id
        }
        commonName
        scientificName
        image {
          url
          description
        }
        wateringSchedule
        lastWatered
        sunlight
        happiness
      }
    }
  }`

  const fetchPlants = async () => {
    try {
      return await fetch(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.VITE_CONTENTFUL_SPACE_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.VITE_CONTENTFUL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        }
      )
        .then((response) => response.json())
        .then((json) => json?.data?.plantCollection?.items)
    } catch (error) {
      throw new Error('Could not receive the data from Contentful!\n' + error)
    }
  }

  const plants = await fetchPlants()

  return res.send(plants)
}
