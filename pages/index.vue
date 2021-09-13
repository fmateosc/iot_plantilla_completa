<template>
  <div>
    <NavOne />
    <BannerOne />
    <Features />
    <Counter />
    <ServiceOne />
    <ServiceTwo />    
    <Screenshots />
    <Pricing />
    <Testimonial />
    <ClientsLogo />
    <Footer />
  </div>
</template>

<script>
import "@/assets/css/bootstrap.min.css";
import "@/assets/css/font-awesome.min.css";
import "@/assets/plugins/mediabox/mediabox.min.css";
import "@/assets/css/style.css";
import "@/assets/css/responsive.css";
import "@/assets/css/custom.css";

import "@/assets/plugins/mediabox/mediabox.min.js";

import NavOne from "../components/NavOne";
import BannerOne from "../components/BannerOne";
import Footer from "../components/Footer";
import Features from "../components/Features";
import Counter from "../components/Counter";
import ServiceTwo from "../components/ServiceTwo";
import ServiceOne from "../components/ServiceOne";
import Video from "../components/Video";
import Screenshots from "../components/Screenshots";
import Pricing from "../components/Pricing";
import Testimonial from "../components/Testimonial";
import ClientsLogo from "../components/ClientsLogo";
import BlogHome from "../components/BlogHome";
import DownloadApp from "../components/DownloadApp";
export default {
  middleware: "index",
  layout: "landingpage",
  components: {
    DownloadApp,
    BlogHome,
    ClientsLogo,
    Testimonial,
    Pricing,
    Screenshots,
    Video,
    ServiceOne,
    ServiceTwo,
    Counter,
    Features,
    Footer,
    BannerOne,
    NavOne
  }
};
</script>
