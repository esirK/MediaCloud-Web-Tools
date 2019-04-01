import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { selectMediaPickerQueryArgs, fetchMediaPickerSources } from '../../../../actions/systemActions';
import { FETCH_ONGOING } from '../../../../lib/fetchConstants';
import SourceResultsTable from './SourceResultsTable';
import AdvancedMediaPickerSearchForm from '../AdvancedMediaPickerSearchForm';
import MediaPickerSearchForm from '../MediaPickerSearchForm';
import LoadingSpinner from '../../LoadingSpinner';
import { notEmptyString } from '../../../../lib/formValidators';
import { ALL_MEDIA } from '../../../../lib/mediaUtil';

const localMessages = {
  title: { id: 'system.mediaPicker.sources.title', defaultMessage: 'Sources matching "{name}"' },
  hintText: { id: 'system.mediaPicker.sources.hint', defaultMessage: 'Search sources by name or url' },
  noResults: { id: 'system.mediaPicker.sources.noResults', defaultMessage: 'No results. Try searching for the name or URL of a specific source to see if we cover it, like Washington Post, Hindustan Times, or guardian.co.uk.' },
  showAdvancedOptions: { id: 'system.mediaPicker.sources.showAdvancedOptions', defaultMessage: 'Show Advanced Options' },
  hideAdvancedOptions: { id: 'system.mediaPicker.sources.hideAdvancedOptions', defaultMessage: 'Hide Advanced Options' },
  allMedia: { id: 'system.mediaPicker.sources.allMedia', defaultMessage: 'All Media (not advised)' },
};

const formSelector = formValueSelector('advanced-media-picker-search');

class SourceSearchResultsContainer extends React.Component {
  state = {
    showAdvancedOptions: true,
  }

  updateMediaQuery(values) {
    const { formQuery, updateMediaQuerySelection, selectedMediaQueryType } = this.props;
    const updatedQueryObj = Object.assign({}, values, { type: selectedMediaQueryType });

    const formValues = formQuery['advanced-media-picker-search'];
    updatedQueryObj.tags = [];
    const metadataQueryFields = ['publicationCountry', 'publicationState', 'primaryLanguage', 'countryOfFocus', 'mediaType'];
    metadataQueryFields.forEach((key) => {
      if (formValues && key in formValues) {
        updatedQueryObj.tags.push(formValues[key]);
      }
    });
    if ('allMedia' in values) {
      updatedQueryObj.tags.push(values.allMedia);
    }
    this.setState(updatedQueryObj);
    updateMediaQuerySelection(updatedQueryObj);
  }

  render() {
    const { fetchStatus, selectedMediaQueryKeyword, hanldeUpdateAndSearchWithSelection, sourceResults, onToggleSelected } = this.props;
    const { formatMessage } = this.props.intl;
    let content = null;
    let resultContent = null;
    if (this.state.showAdvancedOptions) {
      content = (
        <div>
          <AdvancedMediaPickerSearchForm
            initValues={{ storedKeyword: { mediaKeyword: selectedMediaQueryKeyword } }}
            onMetadataSelection={val => this.updateMediaQuery(val)}
            onSearch={hanldeUpdateAndSearchWithSelection}
            hintText={formatMessage(localMessages.hintText)}
          />
        </div>
      );
    } else {
      content = (
        <div>
          <MediaPickerSearchForm
            initValues={{ storedKeyword: { mediaKeyword: selectedMediaQueryKeyword } }}
            onSearch={val => this.updateMediaQuery(val)}
            hintText={formatMessage(localMessages.hintText)}
          />
          <a href="#toggle" onClick={this.toggleAdvancedOptions} className="media-picker-search-advanced"><FormattedMessage {...localMessages.showAdvancedOptions} /></a>
        </div>
      );
    }
    if (fetchStatus === FETCH_ONGOING) {
      resultContent = <LoadingSpinner />;
    } else if (sourceResults && (sourceResults.list && (sourceResults.list.length > 0 || (sourceResults.args && sourceResults.args.media_keyword)))) {
      resultContent = (
        <SourceResultsTable
          title={formatMessage(localMessages.title, { name: selectedMediaQueryKeyword })}
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
        {resultContent}
      </div>
    );
  }
}

SourceSearchResultsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  selectedMediaQueryType: PropTypes.number,
  selectedMediaQueryKeyword: PropTypes.string,
  sourceResults: PropTypes.object,
  formQuery: PropTypes.object,
  // from dispatch
  updateMediaQuerySelection: PropTypes.func.isRequired,
  // updateAdvancedMediaQuerySelection: PropTypes.func.isRequired,
  hanldeUpdateAndSearchWithSelection: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.sourceQueryResults.fetchStatus,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
  sourceResults: state.system.mediaPicker.sourceQueryResults,
  formQuery: formSelector(
    state,
    'advanced-media-picker-search.publicationCountry',
    'advanced-media-picker-search.publicationState',
    'advanced-media-picker-search.primaryLanguage',
    'advanced-media-picker-search.countryOfFocus',
    'advanced-media-picker-search.mediaType',
    'advanced-media-picker-search.allMedia',
  ),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  /* updateMediaQuerySelection: (values) => {
    if (values && notEmptyString(values.mediaKeyword)) {
      dispatch(selectMediaPickerQueryArgs(values));
      dispatch(fetchMediaPickerSources({ media_keyword: values.mediaKeyword }));
    }
  }, */
  updateMediaQuerySelection: (values) => {
    if (values && (notEmptyString(values.mediaKeyword) || (values.tags && values.tags.length > 0))) {
      if (values.allMedia) { // handle the "all media" placeholder selection
        ownProps.onToggleSelected({ id: ALL_MEDIA, label: ownProps.intl.formatMessage(localMessages.allMedia) });
      } else {
        dispatch(selectMediaPickerQueryArgs(values));
      }
    }
  },
  hanldeUpdateAndSearchWithSelection: (values) => {
    if (values.mediaKeyword || (values.tags && values.tags.length > 0)) {
      if (values.allMedia) { // handle the "all media" placeholder selection
        ownProps.onToggleSelected({ id: ALL_MEDIA, label: ownProps.intl.formatMessage(localMessages.allMedia) });
      } else {
        dispatch(selectMediaPickerQueryArgs(values));
        dispatch(fetchMediaPickerSources({ media_keyword: values.mediaKeyword || '*', tags: values.tags.map(tag => tag.tags_id) }));
      }
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    SourceSearchResultsContainer
  )
);
