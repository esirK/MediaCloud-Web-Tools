import { getBrandDarkerColor } from '../styles/colors';
import { parseId } from './numberUtil';
import { serializeQueriesForUrl } from './explorerUtil';

// internal tag used to get the hostname from a url
const tempATag = document.createElement('a');

// return the URL to the favicon for a website domain
export function googleFavIconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}`;
}

// return our best guess for the domain name of a story
export function storyDomainName(story) {
  // use guid unless it isn't a url
  if ({}.hasOwnProperty.call(story, 'guid')) {
    tempATag.href = (story.guid.startsWith('http')) ? story.guid : story.url;
  } else {
    tempATag.href = story.url;
  }
  // get the domain without any subdomain
  const domain = tempATag.hostname;
  return domain;
}

export function urlToSourceManager(param) {
  return `https://sources.civicsignal.africa/#/${param}`;
}

export function urlToCollection(param) {
  return urlToSourceManager(`collections/${param}`);
}

export function urlToSource(param) {
  return urlToSourceManager(`sources/${param}`);
}

export function urlToTopicMapper(param) {
  return `https://topics.civicsignal.africa/#/${param}`;
}

export function urlToExplorer(param) {
  return `https://explorer.civicsignal.africa/#/${param}`;
}

export function urlToTools(param) {
  return `https://tools.civicsignal.africa/#/${param}`;
}

export function urlToExplorerQuery(name, keywords, sourceIds, collectionIds, startDate, endDate) {
  let sources = sourceIds || [];
  let collections = collectionIds || [];
  sources = sources.map(mediaId => parseId(mediaId));
  collections = collections.map(tagsId => parseId(tagsId));
  const query = {
    label: name,
    q: keywords,
    color: getBrandDarkerColor().substr,
    startDate,
    endDate,
    sources,
    collections,
  };
  return `https://explorer.civicsignal.africa/#/queries/search?qs=${serializeQueriesForUrl([query])}`;
}
