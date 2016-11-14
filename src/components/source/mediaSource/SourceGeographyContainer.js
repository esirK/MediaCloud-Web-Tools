import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import composeAsyncContainer from '../../common/AsyncContainer';
import GeoChart from '../../vis/GeoChart';
import DataCard from '../../common/DataCard';
import { fetchSourceGeo } from '../../../actions/sourceActions';
import messages from '../../../resources/messages';
import composeHelpfulContainer from '../../common/HelpfulContainer';
import { DownloadButton } from '../../common/IconButton';

const localMessages = {
  title: { id: 'source.summary.map.title', defaultMessage: 'Geographic Attention' },
  helpTitle: { id: 'source.summary.map.help.title', defaultMessage: 'Geographic Attention' },
  intro: { id: 'source.summary.map.intro',
    defaultMessage: '<p>Here is a heatmap of countries mentioned by this source (based on a sample of sentences). Darker countried are mentioned more. Click a country to load a Dashboard search showing you how the this source covers it.</p>' },
};

class SourceGeographyContainer extends React.Component {
  downloadCsv = () => {
    const { source } = this.props;
    const url = `/api/sources/${source.media_id}/geography/geography.csv`;
    window.location = url;
  }
  handleCountryClick= (event, geo) => {
    const { source } = this.props;
    const countryName = geo.name;
    const countryTagId = geo.tags_id;
    const url = `https://dashboard.mediacloud.org/#query/["(tags_id_story_sentences: ${countryTagId})"]/[{"sources":[${source.media_id}]}]/["${source.health.start_date.substring(0, 10)}"]/["${source.health.end_date.substring(0, 10)}"]/[{"uid":1,"name":"${source.name} - ${countryName}","color":"55868A"}]`;
    window.open(url, '_blank');
  }
  render() {
    const { intro, geolist, helpButton } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <DataCard>
        <div className="actions">
          <DownloadButton tooltip={formatMessage(messages.download)} onClick={this.downloadCsv} />
        </div>
        <h2>
          <FormattedMessage {...localMessages.title} />
          {helpButton}
        </h2>
        <p>{intro}</p>
        <GeoChart data={geolist} onCountryClick={this.handleCountryClick} />
      </DataCard>
    );
  }
}

SourceGeographyContainer.propTypes = {
  // from parent
  source: React.PropTypes.object.isRequired,
  // from state
  fetchStatus: React.PropTypes.string,
  geolist: React.PropTypes.array.isRequired,
  // from dispatch
  asyncFetch: React.PropTypes.func.isRequired,
  // from parent
  intro: React.PropTypes.string,
  // from composition
  intl: React.PropTypes.object.isRequired,
  helpButton: React.PropTypes.node.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.selected.details.sourceDetailsReducer.geoTag.fetchStatus,
  total: state.sources.selected.details.sourceDetailsReducer.geoTag.total,
  geolist: state.sources.selected.details.sourceDetailsReducer.geoTag.list,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  asyncFetch: () => {
    dispatch(fetchSourceGeo(ownProps.source.media_id));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
       composeHelpfulContainer(localMessages.helpTitle, [localMessages.intro, messages.heatMapHelpText])(
        composeAsyncContainer(
          SourceGeographyContainer
        )
      )
    )
  );
