import { localAxios } from "@/util/http-commons";

const local = localAxios();

function listRoutes(success, fail) {
  local.get(`/routes`).then(success).catch(fail);
}
// api/route.js

function getRouteDetail(routeId, success, fail) {
  local.get(`/routes/${routeId}`).then(success).catch(fail);
}

export { listRoutes, getRouteDetail };
