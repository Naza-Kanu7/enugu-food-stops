import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Banner from '../../components/banner'
import { IBM_Plex_Sans } from 'next/font/google'
import Card from '../../components/card'
import coffeeStoresData from '../../data/coffee-stores.json'
import { fetchCoffeeStores } from '../../lib/coffee-stores'
import useTrackLocation from '../../hooks/use-track-location'
import { useEffect, useState, useContext } from 'react'
import { ACTION_TYPES, StoreContext } from '../../context/store-context'



const IBMPlexSans = IBM_Plex_Sans({
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
})

export async function getStaticProps(context) {
  
  const coffeeStores = await fetchCoffeeStores()

  return{
    props: {
      coffeeStores: coffeeStores,
    },
  }
}

export default function Home(props) {

  const { handleTrackLocation, locationErrorMsg, isFindingLocation } = useTrackLocation()

  // const [coffeeStores, setCoffeeStores] = useState('')
  const [coffeeStoresError, setCoffeeStoresError] = useState(null)

  const {dispatch, state} = useContext(StoreContext)

  const { coffeeStores, latLong } = state


  useEffect(() => {
    async function setCoffeeStoresByLocation() {
      if (latLong) {
        try {
          const response = await fetch(`/api/getCoffeeStoresByLocation?latLong=${latLong}&limit=30`)
          const coffeeStores = await response.json()
          
          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORES,
            payload: {
              coffeeStores,
            }
          })
          setCoffeeStoresError('')
        }
        catch (error) {
          // set error
          setCoffeeStoresError(error.message)
        }
      }
    }
    setCoffeeStoresByLocation();
  },[latLong, dispatch])

  const handleOnBannerBtnClick = () => {
    handleTrackLocation()
  }

  return (
    <div >
      <Head>
        <title>Food Connoisseur</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Banner buttonText={isFindingLocation ? 'Locating...' : 'View stores nearby'}handleOnClick={handleOnBannerBtnClick}/>
        {locationErrorMsg && `Something went wrong: ${locationErrorMsg}`}
        {coffeeStoresError && `Something went wrong: ${coffeeStoresError}`}
        
        <div className={styles.heroImage}>
          <Image src='/static/hero-image.png' alt='bg-img' width={700} height={400} />      
        </div>
        {
          coffeeStores.length > 0 && 
            <div className={styles.sectionWrapper}>
              <h2 className={styles.heading2}>Stores Near Me</h2>
              <div className={styles.cardLayout}>
                {
                  coffeeStores.map(coffeeStore => {
                    return (
                      <Card 
                        key={coffeeStore.fsq_id}
                        name={coffeeStore.name} 
                        imgUrl={coffeeStore.imgUrl || "https://images.unsplash.com/photo-1498804103079-a6351b050096?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2468&q=80"}  
                        href={`/coffee-store/${coffeeStore.fsq_id}`}
                        className={styles.card}
                      />
                    )
                  })
                }
              </div>
            </div> 
        }


        {
          props.coffeeStores.length > 0 && 
            <div className={styles.sectionWrapper}>
              <h2 className={styles.heading2}>Enugu Food Stops</h2>
              <div className={styles.cardLayout}>
                {
                  props.coffeeStores.map(coffeeStore => {
                    return (
                      <Card 
                        key={coffeeStore.fsq_id}
                        name={coffeeStore.name} 
                        imgUrl={coffeeStore.imgUrl || "https://images.unsplash.com/photo-1498804103079-a6351b050096?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2468&q=80"}  
                        href={`/coffee-store/${coffeeStore.fsq_id}`}
                        className={styles.card}
                      />
                    )
                  })
                }
              </div>
            </div> 
        }
      </main>
    </div>
  )
}
