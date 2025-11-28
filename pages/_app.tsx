import type { AppProps } from "next/app"
import "@/styles/globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  )
}

