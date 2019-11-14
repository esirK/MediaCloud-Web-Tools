import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import PlatformDescription from './PlatformDescription';
import { PLATFORM_OPEN_WEB, PLATFORM_REDDIT, PLATFORM_TWITTER } from '../../../../lib/platformTypes';
import KeywordSearchIcon from '../../../common/icons/KeywordSearchIcon';

const localMessages = {
  about: { id: 'platformPicker.about',
    defaultMessage: 'You can build a number of different kinds of platforms.' },
  keywordName: { id: 'platform.openWeb.name', defaultMessage: 'Open Web' },
  keywordDescription: { id: 'platform.openWeb.description',
    defaultMessage: 'Open Web description' },
  redditName: { id: 'platform.reddit.name', defaultMessage: 'Reddit' },
  redditDescription: { id: 'platform.reddit.description',
    defaultMessage: 'Reddit description' },
  twitterName: { id: 'platform.twitter.name', defaultMessage: 'Twitter' },
  twitterDescription: { id: 'platform.twitter.description', defaultMessage: 'Twitter description.' },
  automagicName: { id: 'platform.automagic.name', defaultMessage: 'Auto-Magic' },
  automagicDescription: { id: 'platform.automagic.description',
    defaultMessage: 'When you aren\'t sure what is going on, we can use an algorithm to detect communities of sub-conversations within the Topic for you, creating a Subtopic for each.' },
};

const formSelector = formValueSelector('platform');

class PlatformSelector extends React.Component {
  handleSelection = (platformName) => {
    const { change } = this.props;
    change('currentPlatformType', platformName);
  }

  render() {
    const { currentPlatformType } = this.props;
    return (
      <div className="platform-selector">
        <Row>
          <Col lg={3}>
            <PlatformDescription
              onClick={() => this.handleSelection(PLATFORM_OPEN_WEB)}
              selected={currentPlatformType === PLATFORM_OPEN_WEB}
              id="openWeb"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.keywordName}
              descriptionMsg={localMessages.keywordDescription}
            />
          </Col>
          <Col lg={3}>
            <PlatformDescription
              onClick={() => this.handleSelection(PLATFORM_REDDIT)}
              selected={currentPlatformType === PLATFORM_REDDIT}
              id="Reddit"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.redditName}
              descriptionMsg={localMessages.redditDescription}
            />
          </Col>
          <Col lg={3}>
            <PlatformDescription
              onClick={() => this.handleSelection(PLATFORM_TWITTER)}
              selected={currentPlatformType === PLATFORM_TWITTER}
              id="twitter"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.twitterName}
              descriptionMsg={localMessages.twitterDescription}
            />
          </Col>
          <Col lg={3}>
            <p className="light"><i><FormattedMessage {...localMessages.about} /></i></p>
          </Col>
        </Row>
      </div>
    );
  }
}

PlatformSelector.propTypes = {
  // from parent
  // from componsition chain
  intl: PropTypes.object.isRequired,
  change: PropTypes.func.isRequired,
  // from state
  currentPlatformType: PropTypes.string,
};

const mapStateToProps = state => ({
  // platform from form so we know when to show the platform sub form
  currentPlatformType: formSelector(state, 'platform'),
});

function validate() {
  const errors = {};
  return errors;
}

const reduxFormConfig = {
  form: 'platform', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // so the wizard works
  validate,
};


export default
injectIntl(
  reduxForm(reduxFormConfig)(
    connect(mapStateToProps)(
      PlatformSelector
    )
  )
);
