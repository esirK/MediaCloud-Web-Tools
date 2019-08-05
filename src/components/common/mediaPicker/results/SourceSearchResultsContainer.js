import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { Col } from 'react-flexbox-grid/lib';
import { selectMediaPickerQueryArgs, fetchMediaPickerSources, selectMediaCustomColl } from '../../../../actions/systemActions';
import { FETCH_ONGOING } from '../../../../lib/fetchConstants';
import SourceResultsTable from './SourceResultsTable';
import AdvancedMediaPickerSearchForm from '../AdvancedMediaPickerSearchForm';
import LoadingSpinner from '../../LoadingSpinner';
import AppButton from '../../AppButton';
import { metadataQueryFields } from '../../../../lib/explorerUtil';

const localMessages = {
  title: { id: 'system.mediaPicker.sources.title', defaultMessage: 'Sources matching \' {name} and {tags} \'' },
  hintText: { id: 'system.mediaPicker.sources.hint', defaultMessage: 'Search sources by name or url' },
  noResults: { id: 'system.mediaPicker.sources.noResults', defaultMessage: 'No results. Try searching for the name or URL of a specific source to see if we cover it, like Washington Post, Hindustan Times, or guardian.co.uk.' },
  showAdvancedOptions: { id: 'system.mediaPicker.sources.showAdvancedOptions', defaultMessage: 'Show Advanced Options' },
  hideAdvancedOptions: { id: 'system.mediaPicker.sources.hideAdvancedOptions', defaultMessage: 'Hide Advanced Options' },
  allMedia: { id: 'system.mediaPicker.sources.allMedia', defaultMessage: 'All Media (not advised)' },
  customColl: { id: 'system.mediaPicker.sources.customColl', defaultMessage: '<< Add Custom Collection' },
};

const formSelector = formValueSelector('advanced-media-picker-search');

class SourceSearchResultsContainer extends React.Component {
  componentWillMount() {
    const { selectedMediaQueryType, updateMediaQuerySelection } = this.props;
    this.correlateSelection(this.props);
    updateMediaQuerySelection({ type: selectedMediaQueryType, tags: {} }); // clear out previous selections
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedMedia !== this.props.selectedMedia
      // if the results have changed from a keyword entry, we need to update the UI
      || (nextProps.sourceResults && nextProps.sourceResults.lastFetchSuccess !== this.props.sourceResults.lastFetchSuccess)) {
      this.correlateSelection(nextProps);
    }
  }

  // values may contain mediaKeyword, tags, allMedia, customColl
  processQuery = (values) => {
    const { formQuery, selectedMediaQueryType, selectedMediaQueryKeyword, selectedMediaQueryTags, selectedMediaQueryAllTags } = this.props;
    // essentially reselect all values that are currently selected, plus the newly clicked/entered ones
    // any updates to MediaQuery need to be in the right form { type, tags, allMedia || customColl || null }
    // initialize with previously selected query args
    const updatedQueryObj = Object.assign({}, { mediaKeyword: selectedMediaQueryKeyword, type: selectedMediaQueryType, tags: selectedMediaQueryTags, allMedia: selectedMediaQueryAllTags });

    if (updatedQueryObj.tags === undefined) {
      updatedQueryObj.tags = []; // if first metadata selection
    }

    // ignore/remove any non metadata args (like search etc)
    metadataQueryFields.forEach((key) => {
      if (updatedQueryObj.tags[key] === undefined) {
        updatedQueryObj.tags[key] = [];
      }
      // update tags with information we need to keep in query args
      Object.values(values).forEach((obj) => {
        if (obj !== undefined && obj !== null
          && obj.name
          && obj.name === key) {
          const modifiedObjIndex = updatedQueryObj.tags[key].findIndex(o => obj.tags_id === o.tags_id);
          if (modifiedObjIndex > -1) {
            updatedQueryObj.tags[key][modifiedObjIndex].value = obj.value; // update
            updatedQueryObj.tags[key][modifiedObjIndex].selected = obj.value; // update
            updatedQueryObj.tags[key][modifiedObjIndex].tag_sets_id = obj.tag_sets_id;
            updatedQueryObj.tags[key][modifiedObjIndex].tag_set_label = obj.tag_set_label;
          } else if (obj.tags_id) {
            const updatedWithSelection = obj;
            if (updatedWithSelection.value !== false && updatedWithSelection.value !== undefined) { // user has selected a new entry and we set the selected flag acc to the value
              updatedWithSelection.selected = true;
            }
            updatedQueryObj.tags[key].tag_sets_id = obj.tag_sets_id;
            updatedQueryObj.tags[key].tag_set_label = obj.tag_set_label;
            updatedQueryObj.tags[key].push(updatedWithSelection); // or insert ? Or do in reducer?
          }
        }
      });
    });


    if (typeof values === 'object' && 'allMedia' in values) {
      updatedQueryObj.allMedia = values.allMedia;
    } else if (typeof values === 'object' && 'customColl' in values) {
      updatedQueryObj.tags.name = 'search';
      updatedQueryObj.tags.label = 'search';
      updatedQueryObj.customColl = values.customColl;
      updatedQueryObj.id = Math.random(0, 100000);
    }
    updatedQueryObj.mediaKeyword = formQuery.advancedSearchQueryString;
    return updatedQueryObj;
  }

  updateQuerySelection = (metadataType, values) => {
    // triggered when a singular metadata is un/checked
    const { updateMediaQuerySelection } = this.props;
    const updatedQueryObj = this.processQuery([values]);

    updateMediaQuerySelection(updatedQueryObj);
  }

  addCustomSelection = (values) => {
    const { handleSelectMediaCustomColl } = this.props;
    // get current selected tags and current selected media
    const updatedQueryObj = this.processQuery(values);

    handleSelectMediaCustomColl(updatedQueryObj);
  }

  updateAndSearchWithSelection = (values) => {
    const { handleUpdateAndSearchWithSelection } = this.props;
    const updatedQueryObj = this.processQuery(values);
    handleUpdateAndSearchWithSelection(updatedQueryObj);
  }

  correlateSelection(whichProps) {
    const whichList = whichProps.sourceResults.list;

    // if selected media has changed, update current results
    if (whichProps.selectedMedia && whichProps.selectedMedia.length > 0
      // we can't be sure we have received results yet
      && whichList && whichList.length > 0) {
      // sync up selectedMedia and push to result sets.
      whichList.map((m) => {
        const mediaIndex = whichProps.selectedMedia.findIndex(q => q.id === m.id);
        if (mediaIndex < 0) {
          this.props.handleMediaConcurrency(m, false);
        } else if (mediaIndex >= 0) {
          this.props.handleMediaConcurrency(m, true);
        }
        return m;
      });
    }
    return 0;
  }

  render() {
    const { fetchStatus, selectedMediaQueryKeyword, sourceResults, onToggleSelected, selectedMediaQueryTags, selectedMediaQueryAllTags } = this.props;
    const { formatMessage } = this.props.intl;
    let content = null;
    let resultContent = null;
    content = (
      <div>
        <AdvancedMediaPickerSearchForm
          initialValues={{ mediaKeyword: selectedMediaQueryKeyword, advancedSearchQueryString: selectedMediaQueryKeyword, tags: selectedMediaQueryTags, allMedia: selectedMediaQueryAllTags }}
          onQueryUpdateSelection={(metadataType, values) => this.updateQuerySelection(metadataType, values)}
          onSearch={val => this.updateAndSearchWithSelection(val)}
          hintText={formatMessage(localMessages.hintText)}
          keepDirtyOnReinitialize
        />
      </div>
    );

    const addAllButton = (
      <Col lg={8}>
        <AppButton
          style={{ marginTop: -30, float: 'right' }}
          label={formatMessage(localMessages.customColl)}
          onClick={() => this.addCustomSelection({ customColl: true })}
          color="primary"
          disabled={!selectedMediaQueryTags || Object.keys(selectedMediaQueryTags).length === 0 || sourceResults === undefined || sourceResults.list.length === 0}
        />
      </Col>
    );

    if (fetchStatus === FETCH_ONGOING) {
      resultContent = <LoadingSpinner />;
    } else if (sourceResults && (sourceResults.list && (sourceResults.list.length > 0 || (sourceResults.args && sourceResults.args.media_keyword)))) {
      const tags = Object.keys(selectedMediaQueryTags)
        .filter(t => metadataQueryFields.has(t) > 0 && Array.isArray(selectedMediaQueryTags[t]) && selectedMediaQueryTags[t].length > 0)
        .map((i) => {
          const obj = selectedMediaQueryTags[i];
          return obj.map(a => a.tag_set_name).reduce(l => l);
        });

      resultContent = (
        <SourceResultsTable
          title={formatMessage(localMessages.title, { name: selectedMediaQueryKeyword, tags })}
          sources={sourceResults.list}
          onToggleSelected={onToggleSelected}
        />
      );
    } else {
      resultContent = <FormattedMessage {...localMessages.noResults} />;
    }
    return (
      <div>
        {content}
        {addAllButton}
        {resultContent}
      </div>
    );
  }
}

SourceSearchResultsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  handleMediaConcurrency: PropTypes.func.isRequired,
  updateMediaQuerySelection: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  selectedMedia: PropTypes.array,
  selectedMediaQueryType: PropTypes.number,
  selectedMediaQueryKeyword: PropTypes.string,
  selectedMediaQueryTags: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  selectedMediaQueryAllTags: PropTypes.bool,
  sourceResults: PropTypes.object,
  formQuery: PropTypes.object,
  mediaQuery: PropTypes.array,
  // from dispatch
  // updateAdvancedMediaQuerySelection: PropTypes.func.isRequired,
  handleUpdateAndSearchWithSelection: PropTypes.func.isRequired,
  handleSelectMediaCustomColl: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.sourceQueryResults.fetchStatus,
  selectedMedia: state.system.mediaPicker.selectMedia.list,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
  selectedMediaQueryTags: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.tags : null,
  selectedMediaQueryAllTags: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.allMedia : null,
  sourceResults: state.system.mediaPicker.sourceQueryResults,
  formQuery: formSelector(
    state,
    'publicationCountry',
    'publicationState',
    'primaryLanguage',
    'countryOfFocus',
    'mediaType',
    'allMedia',
    'advancedSearchQueryString',
  ),
});

// tags holds metadata search tags
const mapDispatchToProps = (dispatch, ownProps) => ({
  updateMediaQuerySelection: (values) => {
    if (values && values.tags) {
      if (values.allMedia) { // handle the "all media" placeholder selection
        ownProps.updateMediaQuerySelection({ media_keyword: values.mediaKeyword, type: values.type, allMedia: true });
      } else {
        dispatch(selectMediaPickerQueryArgs({ media_keyword: values.mediaKeyword, type: values.type, tags: Object.assign({}, { ...values.tags }) }));
      }
    }
  },
  handleUpdateAndSearchWithSelection: (values) => {
    if (values.mediaKeyword || values.tags) {
      let tags = null;
      if (!values.allMedia) { // handle the "all media" placeholder selection
        dispatch(selectMediaPickerQueryArgs(values));
        tags = Object.values(values.tags).filter(t => t.length > 0);
        const selectedTags = [];
        // parsing and/or in backend
        tags.forEach((t) => {
          if (Array.isArray(t)) {
            selectedTags.push(t.filter(m => m.value).reduce((a, b) => a.concat(b), []).map(i => i.tags_id));
          }
        });
        tags = selectedTags.filter(t => t.length > 0).join(',');
      }
      dispatch(fetchMediaPickerSources({ media_keyword: values.mediaKeyword || '*', tags: (values.allMedia ? -1 : tags) }));
    }
  },
  handleSelectMediaCustomColl: (values) => {
    dispatch(selectMediaCustomColl(values));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    SourceSearchResultsContainer
  )
);
