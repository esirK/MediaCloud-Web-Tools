import React from 'react';
import Link from 'react-router/lib/Link';
import IconButton from 'material-ui/IconButton';
import { injectIntl } from 'react-intl';
import ArrowDropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ArrowDropUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import OpenInNew from 'material-ui/svg-icons/action/open-in-new';
import messages from '../../resources/messages';
import ExploreIcon from './icons/ExploreIcon';
import DownloadIcon from './icons/DownloadIcon';
import HelpIcon from './icons/HelpIcon';
import DeleteIcon from './icons/DeleteIcon';
import AddIcon from './icons/AddIcon';
import FilledStarIcon from './icons/FilledStarIcon';
import EmptyStarIcon from './icons/EmptyStarIcon';
import SettingsIcon from './icons/SettingsIcon';
import RemoveIcon from './icons/RemoveIcon';
import { getBrandDarkColor, getBrandDarkerColor } from '../../styles/colors';

/**
 * The wrapper for our custom icons.  The idea is that you define all the SVG icons in individual
 * Components in the `icons` directory, then export wrapper instances of them here.
 */
function composeIconButton(Icon, defaultTooltipMessage, useBackgroundColor = true) {
  class AppIconButton extends React.Component {
    state = {
      backgroundColor: getBrandDarkColor(),
    };
    handleMouseEnter = () => {
      this.setState({ backgroundColor: getBrandDarkerColor() });
    }
    handleMouseLeave = () => {
      this.setState({ backgroundColor: getBrandDarkColor() });
    }
    handleClick = (event) => {
      const { onClick } = this.props;
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
    render() {
      const { linkTo, onClick, color, tooltip } = this.props;
      const { formatMessage } = this.props.intl;
      const displayTooltip = ((tooltip !== undefined) && (tooltip !== null)) ? tooltip : formatMessage(defaultTooltipMessage);
      const linkTarget = linkTo || displayTooltip;
      const clickHandler = (onClick) ? this.handleClick : null;
      const otherProps = {};
      if (useBackgroundColor === true) {
        otherProps.backgroundColor = this.state.backgroundColor;
      }
      return (
        <div className="icon-button">
          <Link
            to={linkTarget}
            onClick={clickHandler}
            className="icon-button-link"
            name={displayTooltip}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          >
            <IconButton
              tooltip={displayTooltip}
              style={{ padding: 0, border: 0, width: 26, height: 26, color }}
              tooltipStyles={{ top: 20 }}
            >
              <Icon color={color} {...otherProps} />
            </IconButton>
          </Link>
        </div>
      );
    }
  }
  AppIconButton.propTypes = {
    onClick: React.PropTypes.func,
    linkTo: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object,
    ]),
    tooltip: React.PropTypes.string,
    intl: React.PropTypes.object.isRequired,
    color: React.PropTypes.string,
  };
  return injectIntl(AppIconButton);
}

export const ExploreButton = composeIconButton(ExploreIcon, messages.explore);

export const DownloadButton = composeIconButton(DownloadIcon, messages.download);

export const HelpButton = composeIconButton(HelpIcon, messages.help);

export const DeleteButton = composeIconButton(DeleteIcon, messages.delete);

export const RemoveButton = composeIconButton(RemoveIcon, messages.remove);

export const AddButton = composeIconButton(AddIcon, messages.add);

export const FavoriteButton = composeIconButton(FilledStarIcon, messages.unfavorite);

export const FavoriteBorderButton = composeIconButton(EmptyStarIcon, messages.favorite);

export const ArrowDropDownButton = composeIconButton(ArrowDropDownIcon, messages.open);

export const ArrowDropUpButton = composeIconButton(ArrowDropUpIcon, messages.close);

export const SettingsButton = composeIconButton(SettingsIcon, messages.settings);

export const ReadItNowButton = composeIconButton(OpenInNew, messages.readItNow);
