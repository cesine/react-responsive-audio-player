import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import convertToTime from '../utils/convertToTime';
import getDisplayText from '../utils/getDisplayText';

class AudioProgress extends Component {
  constructor (props) {
    super(props);

    this.audioProgressContainer = null;
    this.audioProgressBoundingRect = null;

    this.setAudioProgressContainerRef = ref => {
      this.audioProgressContainer = ref;
    };

    // bind methods fired on React events
    this.handleSeekPreview = this.handleSeekPreview.bind(this);

    // bind listeners to add on mount and remove on unmount
    this.handleSeekComplete = this.handleSeekComplete.bind(this);
    this.fetchAudioProgressBoundingRect = this.fetchAudioProgressBoundingRect.bind(this);
  }

  componentDidMount () {
    // add event listeners bound outside the scope of our component
    window.addEventListener('mouseup', this.handleSeekComplete);
    document.addEventListener('touchend', this.handleSeekComplete);
    window.addEventListener('resize', this.fetchAudioProgressBoundingRect);
    this.fetchAudioProgressBoundingRect();
  }

  componentWillUnmount () {
    // remove event listeners bound outside the scope of our component
    window.removeEventListener('mouseup', this.handleSeekComplete);
    document.removeEventListener('touchend', this.handleSeekComplete);
    window.removeEventListener('resize', this.fetchAudioProgressBoundingRect);
  }

  handleSeekPreview (event) {
    const { seekUnavailable, seekInProgress, onSeekPreview } = this.props;
    if (seekUnavailable) {
      return;
    }
    // make sure we don't select stuff in the background while seeking
    if (event.type === 'mousedown' || event.type === 'touchstart') {
      document.body.classList.add('noselect');
    } else if (!seekInProgress) {
      return;
    }
    /* we don't want mouse handlers to receive the event
     * after touch handlers if we're seeking.
     */
    event.preventDefault();
    const isTouch = event.type.slice(0, 5) === 'touch';
    const pageX = isTouch ? event.targetTouches.item(0).pageX : event.pageX;
    const boundingRect = this.audioProgressBoundingRect;
    const position = pageX - boundingRect.left - document.body.scrollLeft;
    const containerWidth = boundingRect.width;
    const progress = position / containerWidth;
    onSeekPreview(progress);
  }

  handleSeekComplete (event) {
    const { seekInProgress, onSeekComplete } = this.props;
    /* this function is activated when the user lets
     * go of the mouse, so if .noselect was applied
     * to the document body, get rid of it.
     */
    document.body.classList.remove('noselect');
    if (!seekInProgress) {
      return;
    }
    /* we don't want mouse handlers to receive the event
     * after touch handlers if we're seeking.
     */
    event.preventDefault();
    onSeekComplete();
  }

  fetchAudioProgressBoundingRect () {
    this.audioProgressBoundingRect = this.audioProgressContainer.getBoundingClientRect();
  }

  render () {
    const { audio, playlist, activeTrackIndex, displayedTime } = this.props;
    const duration = audio && audio.duration || 0;
    const displayedProgress = duration ? displayedTime / duration : 0;
    return (
      <div
        className="audio_progress_container"
        ref={this.setAudioProgressContainerRef}
        onMouseDown={this.handleSeekPreview}
        onMouseMove={this.handleSeekPreview}
        onTouchStart={this.handleSeekPreview}
        onTouchMove={this.handleSeekPreview}
      >
        <div
          className="audio_progress"
          style={{ width: `${displayedProgress * 100}%` }}
        />
        <div className="audio_progress_overlay">
          <div className="audio_info_marquee">
            <div className="audio_info noselect" draggable="false">
              {getDisplayText(playlist, activeTrackIndex)}
            </div>
          </div>
          <div className="audio_time_progress noselect" draggable="false">
            {`${convertToTime(displayedTime)} / ${convertToTime(duration)}`}
          </div>
        </div>
      </div>
    );
  }
}

AudioProgress.propTypes = {
  playlist: PropTypes.array,
  activeTrackIndex: PropTypes.number.isRequired,
  displayedTime: PropTypes.number.isRequired,
  seekInProgress: PropTypes.bool.isRequired,
  seekUnavailable: PropTypes.bool.isRequired,
  audio: PropTypes.object,
  onSeekPreview: PropTypes.func.isRequired,
  onSeekComplete: PropTypes.func.isRequired
};

module.exports = AudioProgress;
