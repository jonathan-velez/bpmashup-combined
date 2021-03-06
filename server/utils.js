const bpAPIConfig = require('./config/api');
const queryString = require('query-string');

const constants = require('./config/constants');
const BASE_URL = constants.BP_BASE_URL;

exports.bpTrackFormat = (trackId) => {
  return `http://geo-samples.beatport.com/lofi/${trackId}.LOFI.mp3`;
};

const urlBuilderNew = (reqPath, reqQuery) => {
  if (!reqPath) return;

  // console.log('reqPath', reqPath);
  // console.log('reqQuery', reqQuery);

  const queryStr = queryString.stringifyUrl({
    url: BASE_URL + reqPath,
    query: reqQuery,
  });

  console.log('queryStr', queryStr);

  return queryStr;
};

exports.urlBuilderNew = urlBuilderNew;

const urlBuilder = (reqPath, reqQuery) => {
  // This is a util function to build the URL string for the BP API after validating the query string sent to our API.
  // It will compare the query strings from our API against the BP API config bpAPIConfig
  if (!reqPath) return;

  let urlStr = `${reqPath}?`;
  let configMatch = {};
  let urlParams = [];

  configMatch = bpAPIConfig[reqPath];

  if (!configMatch) return;

  // validate query params against config values
  // TODO: If no match found, handle it. currently it will do a wildcard search

  for (let param in reqQuery) {
    for (let value of configMatch.params) {
      if (param === value.name) {
        urlParams.push(param + '=' + reqQuery[param]);
        break;
      }
    }
  }

  //join up the params for the URL string
  urlStr += urlParams.join('&');

  //TODO: first check if there are any required ones

  console.log('URL Request: ', urlStr);

  return urlStr;
};

exports.urlBuilder = urlBuilder;

exports.filterPath = (fullPath) => {
  // strips '/api/' and any query params
  // e.g. '/api/most-popular/genre?id=5&page=1' => 'most-popular/genre'
  return fullPath.substr(5).match('^[^?]*')[0];
};

exports.deslugify = (input) => {
  if (input) {
    return input.replace(/-/g, ' ');
  }
};

exports.constructRequestQueryString = (reqQuery) => {
  // encode facets string
  if (reqQuery.facets) {
    reqQuery = {
      ...reqQuery,
      facets: encodeURIComponent(reqQuery.facets),
    };
  }
  //encode query string
  if (reqQuery.query) {
    reqQuery = {
      ...reqQuery,
      query: encodeURIComponent(reqQuery.query),
    };
  }

  return reqQuery;
};
