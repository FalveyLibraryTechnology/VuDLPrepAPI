var MagicLabeler = {
    prefixes: ['Front ', 'Rear '],
    labels: ['Blank', 'cover', 'fly leaf', 'pastedown', 'Frontispiece', 'Plate'],
    suffixes: [', recto', ', verso'],

    adjustNumericLabel: function(prior, delta) {
        // If it's an integer, this is simple:
        if (parseInt(prior) > 0) {
            return parseInt(prior) + delta;
        }
        // Try roman numerals as a last resort.
        try {
            var arabic = RomanNumerals.toArabic(prior);
            var isUpper = (prior == prior.toUpperCase());
            if (arabic > 0) {
                var newLabel = RomanNumerals.toRoman(arabic + delta);
                if (!isUpper) {
                    newLabel = newLabel.toLowerCase();
                }
                return newLabel;
            }
        } catch (e) {
            // Exception thrown! Guess it's not going to work!
        }
        return false;
    },

    getLabelFromPrevPage: function(p, getLabelCallback) {
        var skipRectoCheck = false;
        while (p > 0) {
            var priorLabel = this.parsePageLabel(getLabelCallback(p - 1));
            if (priorLabel['suffix'] == ', recto' && !skipRectoCheck) {
                priorLabel['suffix'] = ', verso';
                return this.assemblePageLabel(priorLabel);
            }

            var numericLabel = this.adjustNumericLabel(priorLabel['label'], 1);
            if (false !== numericLabel) {
                priorLabel['label'] = numericLabel;
                return this.assemblePageLabel(priorLabel);
            }

            // If we couldn't determine a label based on the previous page,
            // let's go back deeper... however, when doing this deeper search,
            // we don't want to repeat the recto/verso check since that will
            // cause bad results.
            p--;
            skipRectoCheck = true;
        }
        return 1;
    },

    getLabel: function(p, getLabelCallback) {
        // Did some experimentation with getLabelFromNextPage to
        // complement getLabelFromPrevPage, but it winded up having
        // too much recursion and making things too slow.
        return this.getLabelFromPrevPage(p, getLabelCallback);
    },

    assemblePageLabel: function (label) {
        var text = label['prefix'] + label['label'] + label['suffix'];
        return label['brackets'] ? '[' + text + ']' : text;
    },

    parsePageLabel: function(text) {
        var brackets = false;
        text = new String(text);
        if (text.substring(0, 1) == '[' && text.substring(text.length - 1, text.length) == ']') {
            text = text.substring(1, text.length - 1);
            brackets = true;
        }
        var prefix = '';
        for (var i = 0; i < this.prefixes.length; i++) {
            var currentPrefix = this.prefixes[i];
            if (text.substring(0, currentPrefix.length) == currentPrefix) {
                prefix = currentPrefix;
                text = text.substring(currentPrefix.length);
                break;
            }
        }
        var suffix = '';
        for (var i = 0; i < this.suffixes.length; i++) {
            var currentSuffix = this.suffixes[i];
            if (text.substring(text.length - currentSuffix.length) == currentSuffix) {
                suffix = currentSuffix;
                text = text.substring(0, text.length - currentSuffix.length);
                break;
            }
        }
        var label = text;
        return {
            prefix: prefix,
            label: label,
            suffix: suffix,
            brackets: brackets
        };
    }
};
