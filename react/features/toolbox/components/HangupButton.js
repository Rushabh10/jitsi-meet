// @flow

import _ from 'lodash';

import { createToolbarEvent, sendAnalytics } from '../../analytics';
import { appNavigate } from '../../app';
import { disconnect } from '../../base/connection';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { AbstractHangupButton } from '../../base/toolbox';
import type { AbstractButtonProps } from '../../base/toolbox';
import { chatHistory } from '../../chat/actions.js';

/**
 * The type of the React {@code Component} props of {@link HangupButton}.
 */
type Props = AbstractButtonProps & {

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
};

/**
 * Download string as text.
 *
 * @param {string} text - The text to be stored in the string.
 * @param {string} fileType - The fileType to be saved.
 * @param {string} fileName - The name of the file to be saved.
 * @returns {void}
 */
function downloadString(text, fileType, fileName) {
    const blob = new Blob([ text ], { type: fileType });
    const a = document.createElement('a');

    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [ fileType, a.download, a.href ].join(':');
    a.style.display = 'none';
    const body = document.body;

    if (body) {
        body.appendChild(a);
        a.click();
        body.removeChild(a);
    }
    setTimeout(() => {
        URL.revokeObjectURL(a.href);
    }, 1500);
}


/**
 * Component that renders a toolbar button for leaving the current conference.
 *
 * @extends AbstractHangupButton
 */
class HangupButton extends AbstractHangupButton<Props, *> {
    _hangup: Function;

    accessibilityLabel = 'toolbar.accessibilityLabel.hangup';
    label = 'toolbar.hangup';
    tooltip = 'toolbar.hangup';

    /**
     * Initializes a new HangupButton instance.
     *
     * @param {Props} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this._hangup = _.once(() => {
            sendAnalytics(createToolbarEvent('hangup'));

            // FIXME: these should be unified.
            if (navigator.product === 'ReactNative') {
                this.props.dispatch(appNavigate(undefined));
            } else {
                this.props.dispatch(disconnect(true));
            }
        });
    }

    /**
     * Helper function to perform the actual hangup action.
     *
     * @override
     * @protected
     * @returns {void}
     */
    _doHangup() {
        const transcript = chatHistory();
        const date = new Date();

        const fileName = `Jisti Meet ${date.getDate()}/${date.getMonth() + 1}.txt`;

        downloadString(transcript, 'text', fileName);
        this._hangup();
    }
}

export default translate(connect()(HangupButton));
