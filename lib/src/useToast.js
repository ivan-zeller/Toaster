import React from 'react';
import { useLogger } from './contexts';
import { useTimeout } from './hooks';
import { noop } from './utils/func';
import { mergeIfDefined } from './utils/obj';
export const DEFAULT_DATA = {
    text1: undefined,
    text2: undefined
};
export const DEFAULT_OPTIONS = {
    type: 'success',
    position: 'top',
    autoHide: true,
    visibilityTime: 4000,
    topOffset: 40,
    bottomOffset: 40,
    keyboardOffset: 10,
    onShow: noop,
    onHide: noop,
    onPress: noop,
    props: {}
};
export function useToast({ defaultOptions }) {
    const { log } = useLogger();
    const [isVisible, setIsVisible] = React.useState(false);
    const [data, setData] = React.useState(DEFAULT_DATA);
    const initialOptions = mergeIfDefined(DEFAULT_OPTIONS, defaultOptions);
    const [options, setOptions] = React.useState(initialOptions);
    const onAutoHide = React.useCallback(() => {
        log('Auto hiding');
        setIsVisible(false);
        options.onHide();
    }, [log, options]);
    const { startTimer, clearTimer } = useTimeout(onAutoHide, options.visibilityTime);
    const hide = React.useCallback(() => {
        log('Hiding');
        setIsVisible(false);
        clearTimer();
        options.onHide();
    }, [clearTimer, log, options]);
    const show = React.useCallback((params) => {
        log(`Showing with params: ${JSON.stringify(params)}`);
        const { text1 = DEFAULT_DATA.text1, text2 = DEFAULT_DATA.text2, type = initialOptions.type, position = initialOptions.position, autoHide = initialOptions.autoHide, visibilityTime = initialOptions.visibilityTime, topOffset = initialOptions.topOffset, bottomOffset = initialOptions.bottomOffset, keyboardOffset = initialOptions.keyboardOffset, onShow = initialOptions.onShow, onHide = initialOptions.onHide, onPress = initialOptions.onPress, props = initialOptions.props } = params;
        // TODO: validate input
        // TODO: use a queue when Toast is already visible
        // Before the toast queue is implemented,
        // we add this patch to force the previous toast to close and show the next toast (with animation).
      if (isVisible) {
        hide();
        setTimeout(() => {
            setData({
                text1,
                text2
            });
            setOptions(mergeIfDefined(initialOptions, {
                type,
                position,
                autoHide,
                visibilityTime,
                topOffset,
                bottomOffset,
                keyboardOffset,
                onShow,
                onHide,
                onPress,
                props
            }));
          setIsVisible(true);
          onShow();
        }, 250)
      } else {
          setData({
              text1,
              text2
          });
          setOptions(mergeIfDefined(initialOptions, {
              type,
              position,
              autoHide,
              visibilityTime,
              topOffset,
              bottomOffset,
              keyboardOffset,
              onShow,
              onHide,
              onPress,
              props
          }));
        setIsVisible(true);
        onShow();
      }
    }, [initialOptions, log]);
    React.useEffect(() => {
        const { autoHide } = options;
        if (isVisible) {
            if (autoHide) {
                startTimer();
            }
            else {
                clearTimer();
            }
        }
    }, [isVisible, options, startTimer, clearTimer]);
    return {
        isVisible,
        data,
        options,
        show,
        hide
    };
}
