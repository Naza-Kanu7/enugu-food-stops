import '@/styles/globals.css'
import StoreProvider from '../../context/store-context'






export default function App({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  )
}
