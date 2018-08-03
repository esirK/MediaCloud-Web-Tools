import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ActionMenu from '../../common/ActionMenu';
import composeSummarizedVisualization from './SummarizedVizualization';
import { DownloadButton } from '../../common/IconButton';
import { postToDownloadUrl, downloadExplorerSvg } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import WordSpace from '../../vis/WordSpace';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import withQueryResults from './QueryResultsSelector';

const localMessages = {
  title: { id: 'explorer.topWords.title', defaultMessage: 'Word Space' },
  descriptionIntro: { id: 'explorer.topWords.help.title', defaultMessage: '<p>Understanding which words are used together can help you find sub-conversations within the reporting about your issue.  We created this chart to show information about how the top 50 words are used. The bigger and darker a word is, the more it is used. Words are laid out based on how they are used in general news reporting (not based on the stories matching your query). Rollover a word to highlight words used in similar phrases in general news reporting.</p>' },
  noGoogleW2VData: { id: 'wordcloud.editable.mode.googleW2V.noData', defaultMessage: 'Sorry, but the Google News word2vec data is missing.' },
  downloadCsv: { id: 'explorer.googleW2V.downloadCsv', defaultMessage: 'Download { name } word space CSV' },
  downloadSvg: { id: 'explorer.googleW2V.downloadSvg', defaultMessage: 'Download { name } word space SVG' },
};

const WORD_SPACE_DOM_ID = 'query-word-space-wrapper';

class QueryWordSpaceResultsContainer extends React.Component {
  handleDownloadCsv = (query) => {
    postToDownloadUrl('/api/explorer/words/wordcount.csv', query);
  }
  render() {
    const { results, queries, selectedTabIndex, tabSelector } = this.props;
    const domId = `${WORD_SPACE_DOM_ID}-${selectedTabIndex}`;
    return (
      <div>
        {tabSelector}
        <WordSpace
          words={results[selectedTabIndex].list.slice(0, 50)}
          domId={domId}
          xProperty="google_w2v_x"
          yProperty="google_w2v_y"
          noDataMsg={localMessages.noGoogleW2VData}
          length={660}
        />
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            {queries.map((q, idx) =>
              <span key={`wordspace-actions-${idx}`}>
                <MenuItem
                  className="action-icon-menu-item"
                  onTouchTap={() => this.handleDownloadCsv(q)}
                >
                  <ListItemText>
                    <FormattedMessage {...localMessages.downloadCsv} values={{ name: q.label }} />
                  </ListItemText>
                  <ListItemIcon>
                    <DownloadButton />
                  </ListItemIcon>
                </MenuItem>
                <MenuItem
                  className="action-icon-menu-item"
                  onTouchTap={() => {
                    const svgChild = document.getElementById(domId);
                    downloadExplorerSvg(q.label, 'sampled-word-space', svgChild);
                  }}
                >
                  <ListItemText>
                    <FormattedMessage {...localMessages.downloadSvg} values={{ name: q.label }} />
                  </ListItemText>
                  <ListItemIcon>
                    <DownloadButton />
                  </ListItemIcon>
                </MenuItem>
              </span>
            )}
          </ActionMenu>
        </div>
      </div>
    );
  }
}

QueryWordSpaceResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  onQueryModificationRequested: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabSelector: PropTypes.object.isRequired,
  // from dispatch
  handleWordCloudClick: PropTypes.func.isRequired,
  asyncFetch: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  results: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topWords.fetchStatus,
  results: state.explorer.topWords.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleWordCloudClick: (word) => {
    ownProps.onQueryModificationRequested(word.term);
  },
  asyncFetch: () => {
    // pass through because the WordsResults container fetches all the data for us!
  },
  fetchData: () => {
    // pass through because the WordsResults container fetches all the data for us!
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeSummarizedVisualization(localMessages.title, localMessages.descriptionIntro, messages.wordSpaceLayoutHelp)(
        withAsyncFetch(
          withQueryResults(
            QueryWordSpaceResultsContainer
          )
        )
      )
    )
  );
