import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../../resources/messages';

const SnapshotSelector = (props) => {
  const { snapshots, selectedId, onSnapshotSelected } = props;
  let idToPreSelect = selectedId;
  if (idToPreSelect == null) {
    if (snapshots.length > 0) {
      idToPreSelect = snapshots[0].controversy_dumps_id;
    }
  }
  return (
    <div>
      <FormattedMessage {...messages.topicSnapshot} />
      <select defaultValue={idToPreSelect} onChange={onSnapshotSelected}>
        {snapshots.map(snapshot =>
          <option key={snapshot.controversy_dumps_id} value={snapshot.controversy_dumps_id}>
            {snapshot.dump_date.substr(0,16)}
          </option>
        )}
      </select>
    </div>
  );
};

SnapshotSelector.propTypes = {
  snapshots: React.PropTypes.array.isRequired,
  selectedId: React.PropTypes.number,
  intl: React.PropTypes.object.isRequired,
  onSnapshotSelected: React.PropTypes.func,
};

export default injectIntl(SnapshotSelector);
