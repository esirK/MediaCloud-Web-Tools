import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import composeAsyncContainer from '../../../common/AsyncContainer';
import { fetchMedia, selectMedia, selectMediaQueryArgs, fetchCollections } from '../../../../actions/explorerActions';
import ContentPreview from '../../../common/ContentPreview';
import CollectionIcon from '../../../common/icons/CollectionIcon';
import SelectMediaForm from './SelectMediaForm';
import { PICK_COLLECTION, PICK_SOURCE, ADVANCED, STARRED } from '../../../../lib/explorerUtil';
import * as fetchConstants from '../../../../lib/fetchConstants';
/*
const localMessages = {
  searchByName: { id: 'explorer.media.select.searchby.name', defaultMessage: 'Search by Name/URL' },
  searchByMetadata: { id: 'explorer.media.select.searchby.metadata', defaultMessage: 'Search by Metadata' },
  selectedMedia: { id: 'explorer.media.select.media', defaultMessage: 'Selected Media' },
  pubCountrySuggestion: { id: 'explorer.media.select.pubCountryTip', defaultMessage: 'published in' },
  pubStateSuggestion: { id: 'explorer.media.select.pubStateTip', defaultMessage: 'state published in' },
  pLanguageSuggestion: { id: 'explorer.media.select.pLanguageTip', defaultMessage: 'primary language' },
}; */

class SelectMediaResultsContainer extends React.Component {
  updateMediaQuery(values) {
    const { updateMediaSelection, selectedMediaQueryType } = this.props;
    const updatedQueryObj = Object.assign({}, values, { type: selectedMediaQueryType });
    updateMediaSelection(updatedQueryObj);
  }
  handleSelectMedia(media) {
    const { handleSelection } = this.props;
    handleSelection(media);
  }
  render() {
    const { selectedMediaQueryType, selectedMediaQueryKeyword, collectionResults, starredResults, featured } = this.props; // TODO differentiate betwee coll and src
    let content = null;
    let whichMedia = null;
    let whichStoredKeyword = selectedMediaQueryKeyword;
    // user the media that matches the selected media query
    switch (selectedMediaQueryType) {
      case PICK_COLLECTION:
        if (collectionResults && (collectionResults.list && (collectionResults.list.length > 0 || (collectionResults.args && collectionResults.args.keyword)))) {
          whichMedia = collectionResults.list; // since this is the default, check keyword, otherwise it'll be empty
          whichStoredKeyword = collectionResults.args.keyword;
        } else {
          whichMedia = featured;
        }
        break;
      case PICK_SOURCE:
      case ADVANCED:
        break;
      case STARRED:
        whichMedia = starredResults;
        break;
      default:
        whichMedia = featured;
        break;
    }
    if (whichMedia && whichMedia.length > 0) {
      content = (
        <ContentPreview
          items={whichMedia}
          classStyle="browse-items"
          itemType="media"
          icon={<CollectionIcon height={25} />}
          linkInfo={c => `whichMedia/${c.tags_id}`}
          linkDisplay={c => c.label}
          onClick={this.handleSelectMedia}
        />
      );
    }
    return (
      <div className="select-media-container">
        <SelectMediaForm initialValues={whichStoredKeyword} onSearch={val => this.updateMediaQuery(val)} />
        {content}
      </div>
    );
  }
}

SelectMediaResultsContainer.propTypes = {
  intl: React.PropTypes.object.isRequired,
  handleSelection: React.PropTypes.func,
  media: React.PropTypes.array,
  updateMediaSelection: React.PropTypes.func.isRequired,
  selectedMediaQueryKeyword: React.PropTypes.string,
  selectedMediaQueryType: React.PropTypes.number,
  featured: React.PropTypes.array,
  collectionResults: React.PropTypes.object,
  sourcesResults: React.PropTypes.object,
  starredResults: React.PropTypes.object,
};

const mapStateToProps = state => ({
  fetchStatus: (state.explorer.media.collectionQueryResults.fetchStatus === fetchConstants.FETCH_SUCCEEDED || state.explorer.media.featured.fetchStatus === fetchConstants.FETCH_SUCCEEDED) ? fetchConstants.FETCH_SUCCEEDED : fetchConstants.FETCH_INVALID,
  selectedMediaQueryType: state.explorer.media.selectMediaQuery ? state.explorer.media.selectMediaQuery.args.type : null,
  selectedMediaQueryKeyword: state.explorer.media.selectMediaQuery ? state.explorer.media.selectMediaQuery.args.keyword : null,
  sourcesResults: state.explorer.media.media ? state.explorer.media.media : null,
  featured: state.explorer.media.featured ? state.explorer.media.featured.collections : null,
  collectionResults: state.explorer.media.collectionQueryResults ? state.explorer.media.collectionQueryResults : null,
  starredResults: state.explorer.media.starredQueryResults ? state.explorer.media.starredQueryResults : null,
});

const mapDispatchToProps = dispatch => ({
  updateMediaSelection: (values) => {
    if (values) {
      dispatch(selectMediaQueryArgs(values));
      switch (values.type) {
        case PICK_COLLECTION:
          dispatch(fetchCollections(values));
          break;
        case PICK_SOURCE:
        case ADVANCED:
          break;
        case STARRED:
          dispatch(fetchMedia(5)); // TODO make this a real search
          break;
        default:
          break;
      }
    }
  },
  handleSelection: (selectedMedia) => {
    if (selectedMedia) {
      dispatch(selectMedia(selectedMedia));
    }
  },
  asyncFetch: () => {
    // what kind of media is being queried for?
    // default to PICK_COLLECTION
    dispatch(fetchMedia(5)); // TODO make this a real search or "all"
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeAsyncContainer(
        SelectMediaResultsContainer
      )
    )
  );

