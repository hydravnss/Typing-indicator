/* =========================================================
   TYPING INDICATOR
   SillyTavern Extension
   iMessage-style typing bubble
   ========================================================= */

import {
    eventSource,
    event_types,
    saveSettingsDebounced,
} from '../../../../script.js';

import {
    extension_settings,
} from '../../../extensions.js';


/* =========================================================
   CONFIG
   ========================================================= */

const EXTENSION_NAME = 'typing-indicator';
const INDICATOR_ID = 'hydra-typing-indicator';

const DEFAULT_SETTINGS = {
    enabled: true,
};


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettings() {
    if (!extension_settings[EXTENSION_NAME]) {
        extension_settings[EXTENSION_NAME] = {
            ...DEFAULT_SETTINGS,
        };
    }

    if (
        extension_settings[EXTENSION_NAME].enabled === undefined
    ) {
        extension_settings[EXTENSION_NAME].enabled = true;
    }
}


function isEnabled() {
    return extension_settings[EXTENSION_NAME]?.enabled !== false;
}


/* =========================================================
   SVG BUBBLE
   ========================================================= */

function createBubbleSVG() {
    return `
        <svg
            class="hydra-typing-svg"
            viewBox="0 0 92 70"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >

            <!-- Main iMessage bubble -->
            <path
                class="hydra-typing-shape"
                d="
                    M 18 3
                    C 8 5 2 13 2 25
                    C 2 38 9 48 20 51
                    C 25 53 31 53 36 53
                    C 47 58 60 61 70 61
                    C 82 61 90 51 90 37
                    C 90 20 82 5 68 3
                    C 54 1 31 1 18 3
                    Z
                "
            />

            <!-- Tail -->
            <path
                class="hydra-typing-shape"
                d="
                    M 20 47
                    C 18 54 13 59 8 61
                    C 13 61 19 58 24 53
                    Z
                "
            />

            <!-- Small detached bubble -->
            <circle
                class="hydra-typing-shape"
                cx="7"
                cy="67"
                r="5"
            />

        </svg>
    `;
}


/* =========================================================
   CREATE INDICATOR
   ========================================================= */

function createTypingIndicator() {

    if (!isEnabled()) {
        return;
    }

    removeTypingIndicator(true);


    /* -----------------------------------------------------
       Find chat
       ----------------------------------------------------- */

    const chat = document.querySelector('#chat');

    if (!chat) {
        console.warn(
            `[${EXTENSION_NAME}] #chat introuvable.`
        );

        return;
    }


    /* -----------------------------------------------------
       Find last bot message
       ----------------------------------------------------- */

    const messages = [
        ...chat.querySelectorAll('.mes')
    ];

    let lastBotMessage = null;

    for (let i = messages.length - 1; i >= 0; i--) {

        const message = messages[i];

        /*
         * SillyTavern:
         * mes[is_user="false"] = bot message
         */

        if (message.getAttribute('is_user') !== 'true') {
            lastBotMessage = message;
            break;
        }
    }


    /* -----------------------------------------------------
       Create container
       ----------------------------------------------------- */

    const indicator = document.createElement('div');

    indicator.id = INDICATOR_ID;

    indicator.className =
        'hydra-typing-indicator';


    /* -----------------------------------------------------
       SVG + animated dots
       ----------------------------------------------------- */

    indicator.innerHTML = `

        <div class="hydra-typing-bubble">

            ${createBubbleSVG()}

            <div class="hydra-typing-dots">

                <span
                    class="hydra-typing-dot dot-1"
                ></span>

                <span
                    class="hydra-typing-dot dot-2"
                ></span>

                <span
                    class="hydra-typing-dot dot-3"
                ></span>

            </div>

        </div>

    `;


    /* =====================================================
       INSERT POSITION
       ===================================================== */

    if (lastBotMessage) {

        /*
         * IMPORTANT:
         * Put the indicator DIRECTLY AFTER the bot message.
         */

        lastBotMessage.insertAdjacentElement(
            'afterend',
            indicator
        );

    } else {

        /*
         * Fallback if no bot message exists.
         */

        chat.appendChild(indicator);
    }


    /* =====================================================
       APPEAR ANIMATION
       ===================================================== */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            indicator.classList.add('visible');

        });

    });


    /* =====================================================
       KEEP IT VISIBLE
       ===================================================== */

    setTimeout(() => {

        if (!document.body.contains(indicator)) {
            return;
        }

        indicator.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });

    }, 80);
}


/* =========================================================
   REMOVE INDICATOR
   ========================================================= */

function removeTypingIndicator(immediate = false) {

    const indicator =
        document.getElementById(INDICATOR_ID);

    if (!indicator) {
        return;
    }


    /* -----------------------------------------------------
       Immediate removal
       ----------------------------------------------------- */

    if (immediate) {

        indicator.remove();

        return;
    }


    /* -----------------------------------------------------
       Exit animation
       ----------------------------------------------------- */

    indicator.classList.remove('visible');


    setTimeout(() => {

        if (indicator.parentNode) {
            indicator.remove();
        }

    }, 180);
}


/* =========================================================
   GENERATION START
   ========================================================= */

function onGenerationStarted() {

    if (!isEnabled()) {
        return;
    }

    createTypingIndicator();
}


/* =========================================================
   GENERATION END
   ========================================================= */

function onGenerationEnded() {

    removeTypingIndicator(false);
}


/* =========================================================
   GENERATION STOPPED
   ========================================================= */

function onGenerationStopped() {

    removeTypingIndicator(false);
}


/* =========================================================
   SETTINGS UI
   ========================================================= */

function createSettingsUI() {

    const container =
        document.querySelector(
            '#extensions_settings'
        );

    if (!container) {

        console.warn(
            `[${EXTENSION_NAME}] ` +
            '#extensions_settings introuvable.'
        );

        return;
    }


    /* Prevent duplicates */

    if (
        document.querySelector(
            '#typing-indicator-settings'
        )
    ) {
        return;
    }


    /* -----------------------------------------------------
       Settings wrapper
       ----------------------------------------------------- */

    const settings =
        document.createElement('div');

    settings.id =
        'typing-indicator-settings';

    settings.className =
        'extension_container';


    /* -----------------------------------------------------
       HTML
       ----------------------------------------------------- */

    settings.innerHTML = `

        <div class="inline-drawer">

            <div
                class="inline-drawer-toggle
                       inline-drawer-header"
            >

                <b>Typing Indicator</b>

                <div
                    class="inline-drawer-icon
                           fa-solid
                           fa-circle-chevron-down
                           down"
                ></div>

            </div>


            <div class="inline-drawer-content">

                <label
                    class="checkbox_label"
                    for="typing-indicator-enabled"
                >

                    <input
                        id="typing-indicator-enabled"
                        type="checkbox"
                    >

                    <span>
                        Activer le typing indicator
                    </span>

                </label>


                <div
                    style="
                        margin-top: 6px;
                        opacity: 0.65;
                        font-size: 0.9em;
                    "
                >
                    Affiche une bulle iMessage
                    avec trois points animés
                    pendant la génération du bot.
                </div>

            </div>

        </div>

    `;


    container.appendChild(settings);


    /* -----------------------------------------------------
       Checkbox
       ----------------------------------------------------- */

    const checkbox =
        document.querySelector(
            '#typing-indicator-enabled'
        );


    checkbox.checked = isEnabled();


    checkbox.addEventListener(
        'change',
        () => {

            extension_settings[
                EXTENSION_NAME
            ].enabled = checkbox.checked;


            saveSettingsDebounced();


            if (!checkbox.checked) {

                removeTypingIndicator(true);

            }

        }
    );
}


/* =========================================================
   EVENT REGISTRATION
   ========================================================= */

function registerEvents() {

    /* Generation started */

    if (event_types.GENERATION_STARTED) {

        eventSource.on(
            event_types.GENERATION_STARTED,
            onGenerationStarted
        );

    }


    /* Generation ended */

    if (event_types.GENERATION_ENDED) {

        eventSource.on(
            event_types.GENERATION_ENDED,
            onGenerationEnded
        );

    }


    /* Generation stopped */

    if (event_types.GENERATION_STOPPED) {

        eventSource.on(
            event_types.GENERATION_STOPPED,
            onGenerationStopped
        );

    }

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

jQuery(async () => {

    loadSettings();

    createSettingsUI();

    registerEvents();


    console.log(
        '[Typing Indicator] Extension loaded.'
    );

});