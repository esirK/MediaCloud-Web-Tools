import React from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import Link from 'react-router/lib/Link';
import DataCard from './DataCard';
import messages from '../../resources/messages';
import OrderedWordCloud from '../vis/OrderedWordCloud';
import WordCloud from '../vis/WordCloud';
import Permissioned from './Permissioned';
import { DownloadButton, ExploreButton, EditButton } from './IconButton';
import { getBrandDarkColor } from '../../styles/colors';
import { PERMISSION_LOGGED_IN } from '../../lib/auth';
import { downloadSvg } from '../util/svg';
import ActionMenu from './ActionMenu';
import { WarningNotice } from '../common/Notice';


const localMessages = {
  pastWeek: { id: 'wordcloud.time.pastWeek', defaultMessage: 'past week' },
  pastMonth: { id: 'wordcloud.time.pastMonth', defaultMessage: 'past month' },
  pastYear: { id: 'wordcloud.time.pastYear', defaultMessage: 'past year' },
  all: { id: 'wordcloud.time.all', defaultMessage: 'all' },
  editing: { id: 'wordcloud.editable.editingNotice', defaultMessage: 'You are temporarily editing this word cloud. Click words you want to hide, then use the menu to flip back into view mode and export it to SVG.' },
  edited: { id: 'wordcloud.editable.edited', defaultMessage: 'You have temporarily edited this word cloud to remove some of the words. Your changes will be lost when you leave this page.' },
  modeOrdered: { id: 'wordcloud.editable.mode.ordered', defaultMessage: 'Use Ordered Layout' },
  modeUnordered: { id: 'wordcloud.editable.mode.unordered', defaultMessage: 'Use Cloud Layout' },
};

class EditableWordCloudDataCard extends React.Component {

  state = {
    editing: false,   // whether you are editing right now or not
    modifiableWords: null, // all the words, including a boolean display property on each
    displayOnlyWords: null, // only the words that are being displayed
    ordered: true,  // whether you are showing an ordered word cloud or circular layout word cloud
  };

  onEditModeClick = (d, node) => {
    const text = node.nodes()[0];
    if (this.state.modifiableWords) {
      const changeWord = this.state.modifiableWords.filter(w => (w.term === text.textContent));
      changeWord[0].display = !changeWord[0].display;
      this.setState({ modifiableWords: [...this.state.modifiableWords] });  // reset this to trigger a re-render
    }
  };

  toggleOrdered = () => {
    this.setState({ ordered: !this.state.ordered });
  }

  isShowingAllWords = () => (this.state.modifiableWords.length === this.state.displayOnlyWords.length);

  toggleEditing = () => {
    const { words } = this.props;
    // initialize copy of words so we have the display tag set
    if (this.state.modifiableWords == null) {
      const initializeDisplayOfWords = words.map(w => ({ ...w, display: true }));
      const initializeDisplayOnlyWords = words.map(w => ({ ...w, display: true }));
      this.setState({ modifiableWords: initializeDisplayOfWords, displayOnlyWords: initializeDisplayOnlyWords });
    }
    // after initialization if not editing, filter words that say 'don't display'
    if (this.state.modifiableWords != null && this.state.editing) {
      const displayOnlyWords = this.state.modifiableWords.filter(w => w.display === true);
      this.setState({ displayOnlyWords });
    }
    this.setState({ editing: !this.state.editing });
  };

  downloadCsv = () => {
    const { downloadUrl } = this.props;
    window.location = downloadUrl;
  };

  render() {
    const { title, words, onViewModeClick, width, height, maxFontSize, minFontSize, explore, helpButton, domId, timePeriod } = this.props;
    const { formatMessage } = this.props.intl;
    let className = 'editable-word-cloud-datacard';
    let editingClickHandler = onViewModeClick;
    let wordsArray = words.map(w => ({ ...w, display: true }));
    let editingWarning;
    const uniqueDomId = `${domId}-${(this.state.ordered ? 'ordered' : 'unordered')}`; // add mode to it so ordered or not works
    if (this.state.editing && this.state.modifiableWords) {
      editingClickHandler = this.onEditModeClick;
      className += ' editing';
      wordsArray = this.state.modifiableWords;
      editingWarning = (<WarningNotice><FormattedHTMLMessage {...localMessages.editing} /></WarningNotice>);
    } else if (!this.state.editing && this.state.displayOnlyWords) {
      editingClickHandler = onViewModeClick;
      wordsArray = this.state.displayOnlyWords;
      if (!this.isShowingAllWords()) {
        editingWarning = (<WarningNotice><FormattedHTMLMessage {...localMessages.edited} /></WarningNotice>);
      }
    }

    let titleContent = title;
    if (explore) {
      titleContent = (
        <Link to={explore}>
          {title}
        </Link>
      );
    }
    // set up rendered cloud as appropriate
    let cloudContent;
    if (this.state.ordered) {
      cloudContent = (
        <OrderedWordCloud
          words={wordsArray}
          textColor={getBrandDarkColor()}
          width={width}
          height={height}
          maxFontSize={maxFontSize}
          minFontSize={minFontSize}
          onWordClick={editingClickHandler}
          domId={uniqueDomId}
        />
      );
    } else {
      cloudContent = (
        <WordCloud
          words={wordsArray}
          textColor={getBrandDarkColor()}
          width={width}
          height={height}
          maxFontSize={maxFontSize}
          minFontSize={minFontSize}
          onWordClick={editingClickHandler}
          domId={uniqueDomId}
        />
      );
    }
    const exploreButton = explore ? (<ExploreButton linkTo={explore} />) : null;
    return (
      <DataCard className={className}>
        <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
          <div className="actions">
            {exploreButton}
            <ActionMenu>
              <MenuItem
                className="action-icon-menu-item"
                primaryText={formatMessage(this.state.editing ? messages.viewWordCloud : messages.editWordCloud)}
                rightIcon={<EditButton />}
                disabled={!this.state.ordered} // can't edit for now in cloud layout
                onTouchTap={this.toggleEditing}
              />
              <MenuItem
                className="action-icon-menu-item"
                primaryText={formatMessage(this.state.ordered ? localMessages.modeUnordered : localMessages.modeOrdered)}
                disabled={this.state.editing} // can't edit for now in cloud layout
                onTouchTap={this.toggleOrdered}
              />
              <MenuItem
                className="action-icon-menu-item"
                primaryText={formatMessage(messages.downloadCSV)}
                rightIcon={<DownloadButton />}
                disabled={this.state.editing} // can't download until done editing
                onTouchTap={this.downloadCsv}
              />
              <MenuItem
                className="action-icon-menu-item"
                primaryText={formatMessage(messages.downloadSVG)}
                rightIcon={<DownloadButton />}
                disabled={this.state.editing} // can't download until done editing
                onTouchTap={() => {
                  if (this.state.ordered) { // tricky to get the correct element to serialize
                    downloadSvg(uniqueDomId);
                  } else {
                    const svgChild = document.getElementById(uniqueDomId);
                    downloadSvg(svgChild.firstChild);
                  }
                }}
              />
            </ActionMenu>
          </div>
        </Permissioned>

        <span className="words">
          {titleContent}
          {helpButton}
        </span>
        {timePeriod}
        {editingWarning}
        {cloudContent}
      </DataCard>
    );
  }
}

EditableWordCloudDataCard.propTypes = {
  // from parent
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  maxFontSize: React.PropTypes.number,
  minFontSize: React.PropTypes.number,
  title: React.PropTypes.string.isRequired,
  words: React.PropTypes.array.isRequired,
  itemId: React.PropTypes.string,
  downloadUrl: React.PropTypes.string,
  explore: React.PropTypes.object,
  download: React.PropTypes.func,
  helpButton: React.PropTypes.node,
  targetURL: React.PropTypes.string,
  timePeriod: React.PropTypes.object,
    // from dispatch
  onViewModeClick: React.PropTypes.func.isRequired,
  domId: React.PropTypes.string.isRequired,
  // from compositional chain
  intl: React.PropTypes.object.isRequired,
};


export default
  injectIntl(
    connect(null)(
      EditableWordCloudDataCard
    )
  );
