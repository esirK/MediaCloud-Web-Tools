import React from 'react';
import Title from 'react-title-component';
import { push } from 'react-router-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { updateCollection, selectCollection, fetchCollectionDetails } from '../../../actions/sourceActions';
import { updateFeedback } from '../../../actions/appActions';
import composeAsyncContainer from '../../common/AsyncContainer';
import CollectionForm from './form/CollectionForm';

const localMessages = {
  mainTitle: { id: 'collection.mainTitle', defaultMessage: 'Edit Collection' },
  addButton: { id: 'collection.add.saveAll', defaultMessage: 'Update Collection' },
  feedback: { id: 'collection.add.feedback', defaultMessage: 'We updated this collection' },
};

const EditCollectionContainer = (props) => {
  const { handleSave, collection } = props;
  const { formatMessage } = props.intl;
  const titleHandler = parentTitle => `${formatMessage(localMessages.mainTitle)} | ${parentTitle}`;
  const intialValues = {
    ...collection,
    name: collection.label,
    sources: collection.media,
    static: collection.is_static === 1,
    showOnMedia: collection.show_on_media === 1,
    showOnStories: collection.show_on_stories === 1,
  };
  return (
    <div>
      <Title render={titleHandler} />
      <Grid>
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.mainTitle} /></h1>
          </Col>
        </Row>
        <CollectionForm
          initialValues={intialValues}
          onSave={handleSave}
          buttonLabel={formatMessage(localMessages.addButton)}
        />
      </Grid>
    </div>
  );
};

EditCollectionContainer.propTypes = {
  // from context
  intl: React.PropTypes.object.isRequired,
  // from dispatch
  handleSave: React.PropTypes.func.isRequired,
  // form state
  collectionId: React.PropTypes.number.isRequired,
  fetchStatus: React.PropTypes.string.isRequired,
  collection: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  collectionId: parseInt(ownProps.params.collectionId, 10),
  fetchStatus: state.sources.collections.selected.collectionDetails.fetchStatus,
  collection: state.sources.collections.selected.collectionDetails.object,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleSave: (values) => {
    const infoToSave = {
      id: ownProps.params.collectionId,
      name: values.name,
      description: values.description,
      static: values.static,
      showOnMedia: values.showOnMedia,
      showOnStories: values.showOnStories,
    };
    if ('sources' in values) {
      infoToSave['sources[]'] = values.sources.map(s => s.id);
    } else {
      infoToSave['sources[]'] = [];
    }
    // try to save it
    dispatch(updateCollection(infoToSave))
      .then(() => {
        // let them know it worked
        dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
        // TODO: redirect to new source detail page
        dispatch(push(`/collections/${ownProps.params.collectionId}`));
      });
  },
  asyncFetch: () => {
    dispatch(selectCollection(ownProps.params.collectionId));
    dispatch(fetchCollectionDetails(ownProps.params.collectionId));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeAsyncContainer(
        EditCollectionContainer
      ),
    ),
  );
