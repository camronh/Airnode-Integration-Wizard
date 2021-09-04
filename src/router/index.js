import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Testing from "../views/Testing.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/Testing",
    name: "Testing",
    component: Testing,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
