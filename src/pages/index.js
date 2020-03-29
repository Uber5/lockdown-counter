import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import HomeInfoView from "../components/HomeInfoView"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <HomeInfoView />
  </Layout>
)

export default IndexPage
