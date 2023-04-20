import { useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"
import cls from "classnames"
import Head from "next/head"
import useSWR from 'swr'

import styles from '../../styles/coffee-store.module.css'
import placesIcon from '../../../public/static/icons/places.svg'
import starIcon from '../../../public/static/icons/star.svg'
import { fetchCoffeeStores } from "../../../lib/coffee-stores"
import { StoreContext } from "../../../context/store-context"
import { isEmpty } from "../../../utils"


export async function getStaticProps(staticProps) {
    const params = staticProps.params
    const coffeeStores = await fetchCoffeeStores()
    const findCoffeeStoreById = coffeeStores.find((coffeeStore) => {
        return coffeeStore.fsq_id.toString() === params.id
    })
    return {
        props: {
            coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {},
        }
    }
}

export async function getStaticPaths() {
    const coffeeStores = await fetchCoffeeStores()
    const paths = coffeeStores.map((coffeeStore) => {
        return {
            params: {
                id: coffeeStore.fsq_id.toString(),
            }
        }
    })
    return {
        paths: paths ? paths : {},
        fallback: true,
    }
}

const CoffeeStore = (initialProps) => {

    const router = useRouter()

    // if (router.isFallback) {
    //     return <div>Loading...</div>
    // }

    const id = router.query.id

    const [coffeeStore, setCoffeeStore] = useState(initialProps.coffeeStore || {})

    const {
        state: { coffeeStores }
    } = useContext(StoreContext)

    const handleCreateCoffeeStore = async (coffeeStore) => {
        try {
            const {
                fsq_id, 
                name,
                voting, 
                imgUrl, 
                location,
                neighbourhood, 
                address,
            } = coffeeStore
            const response = await fetch('/api/createCoffeeStore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: fsq_id, 
                    name,
                    voting: 0, 
                    imgUrl, 
                    neighbourhood: location.cross_street || '', 
                    address: location.formatted_address || '',
                }),
            })

            const dbCoffeeStore = await response.json()
        } catch(err) {
            console.error('Error creating coffee store', err)
        }
    }

    useEffect(() => {
        if(isEmpty(initialProps.coffeeStore)) {
            if(coffeeStores.length > 0) {
                const coffeeStoreFromContext = coffeeStores.find((coffeeStore) => {
                    return coffeeStore.fsq_id.toString() === id;
                })
                if(coffeeStoreFromContext) {
                    setCoffeeStore(coffeeStoreFromContext)
                    handleCreateCoffeeStore(coffeeStoreFromContext)
                }
            }
        } else {
            handleCreateCoffeeStore(initialProps.coffeeStore)
        }
    }, [id, initialProps, initialProps.coffeeStore, coffeeStores])


    const { imgUrl, name, address } = coffeeStore

    const [votingCount, setVotingCount] = useState(0)
    
    const fetcher = (url) => fetch(url).then((res) => res.json());

    const url = `http://localhost:3000/api/getCoffeeStoreById?id=${id}`

    const { data, error } = useSWR(url, fetcher)

    useEffect(() => {
        if (data) {
            setCoffeeStore(data[0])

            setVotingCount(data[0].voting)
        }
    }, [data])

    const handleUpVoteButton = async () => {
        try {
            const response = await fetch('/api/upvoteCoffeeStoreById', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id, 
                }),
            })

            const dbCoffeeStore = await response.json()
            
            if(dbCoffeeStore && dbCoffeeStore.length > 0) {
                const updatedCount = votingCount + 1
                setVotingCount(updatedCount)
            }
        } catch(err) {
            console.error('Error upvoting coffee store', err)
        }
    }

    if (error) {
        return <div>Something went wrong retrieving coffee store page</div>
    }



    return(
        <div className={styles.layout}>
            <Head>
                <title>{name}</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.col1}>
                    <div className={styles.backToHomeLink}>
                        <Link href='/' >&#x2190; Back to Home</Link>
                    </div>
                    <div className={styles.nameWrapper}>
                        <h1 className={styles.name}>{name}</h1>
                    </div>
                    <div className={styles.storeImgWrapper}>
                        <Image src={imgUrl || "https://images.unsplash.com/photo-1498804103079-a6351b050096?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2468&q=80"} alt='nameee' width={600} height={360} className={styles.storeImg}  />
                    </div>
                </div>
                <div className={cls("glass", styles.col2)}>
                    {address && <div className={styles.iconWrapper}>
                        <Image src={placesIcon} width={24} height={24} alt="icon"/>
                        <p className={styles.text}>{address}</p>
                    </div>}
                    {/* {location.address && <div className={styles.iconWrapper}>
                        <Image src={nearMeIcon} width={24} height={24} alt="icon"/>
                        <p className={styles.text}>{location.formatted_address}</p>
                    </div>} */}
                    <div className={styles.iconWrapper}>
                        <Image src={starIcon} width={24} height={24} alt="icon"/>
                        <p className={styles.text}>{votingCount}</p>
                    </div>
                    <button className={styles.upvoteButton} onClick={handleUpVoteButton}>Up Vote</button>
                </div>
            </div>
        </div>
    )
}
// fsq3AUwbx5uPMqeGMG6NxVG3bj8S9fiT3rPbHBFnYp+QNCc=
// keyLvdHRbZYEfBQqF


export default CoffeeStore