import { FETCH_SOURCE_DETAILS, SET_FAVORITE_SOURCE } from '../../../../actions/sourceActions';
import { createAsyncReducer } from '../../../../lib/reduxHelpers';

export const SOURCE_SCRAPE_STATE_QUEUED = 'queued';
export const SOURCE_SCRAPE_STATE_RUNNING = 'running';
export const SOURCE_SCRAPE_STATE_COMPLETED = 'completed';
export const SOURCE_SCRAPE_STATE_ERROR = 'error';

const sourceDetails = createAsyncReducer({
  initialState: {
  },
  action: FETCH_SOURCE_DETAILS,
  handleSuccess: (payload) => {
    // add in a shortcut to the latest scrape state
    let latestScrapeState;
    if (payload.scrape_status && payload.scrape_status.job_states.length > 0) {
      latestScrapeState = payload.scrape_status.job_states[0].state;
    }
    return {
      ...payload,
      latestScrapeState,
    };
  },
  [SET_FAVORITE_SOURCE]: (payload, state) => ({
    ...state,
    isFavorite: payload.args[1],
  }),
});


export default sourceDetails;
