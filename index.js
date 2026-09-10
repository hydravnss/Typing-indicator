import {
    eventSource,
    event_types,
    saveSettingsDebounced,
} from '../../../../script.js';

import {
    extension_settings,
} from '../../../extensions.js';


/* =========================================================
   TYPING INDICATOR
   iMessage-style typing indicator for SillyTavern
   ========================================================= */

const extension_name = 'typing-indicator';
const typing_id = 'hydra-typing-indicator';

const default_settings = {
    enabled: true,
};


/* =========================================================
   SETTINGS
   ========================================================= */

function load_settings() {
    if (!extension_settings[extension_name]) {
        extension_settings[extension_name] = structuredClone(default_settings);
    }

    for (const key of Object.keys(default_settings)) {
        if (extension_settings[extension_name][key] === undefined) {
            extension_settings[extension_name][key] = default_settings[key];
        }
    }
}


function is_enabled() {
    return extension_settings[extension_name]?.enabled ?? true;
}


/* =========================================================
   CREATE TYPING INDICATOR
   ========================================================= */

function create_typing_indicator() {
    if (!is_enabled()) {
        return;
    }

    remove_typing_indicator(true);

    const chat = document.querySelector('#chat');

    if (!chat) {
        console.warn(`[${extension_name}] #chat introuvable.`);
        return;
    }

    const indicator = document.createElement('div');

    indicator.id = typing_id;
    indicator.className = 'hydra-typing-indicator';

    indicator.innerHTML = `
        <div class="hydra-typing-bubble">
            <span class="hydra-typing-dot dot-1"></span>
            <span class="hydra-typing-dot dot-2"></span>
            <span class="hydra-typing-dot dot-3"></span>
        </div>

        <div class="hydra-typing-tail-large"></div>
        <div class="hydra-typing-tail-small"></div>
    `;

    chat.appendChild(indicator);

    requestAnimationFrame(() => {
        indicator.classList.add('visible');

        indicator.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    });
}


/* =========================================================
   REMOVE TYPING INDICATOR
   ========================================================= */

function remove_typing_indicator(immediate = false) {
    const indicator = document.getElementById(typing_id);

    if (!indicator) {
        return;
    }

    if (immediate) {
        indicator.remove();
        return;
    }

    indicator.classList.remove('visible');

    setTimeout(() => {
        indicator.remove();
    }, 150);
}


/* =========================================================
   EXTENSION SETTINGS UI
   ========================================================= */

function create_settings_ui() {
    const extensions_settings = document.querySelector(
        '#extensions_settings'
    );

    if (!extensions_settings) {
        console.warn(
            `[${extension_name}] Panneau #extensions_settings introuvable.`
        );

        return;
    }

    if (document.querySelector('#typing_indicator_settings')) {
        return;
    }

    const settings_container = document.createElement('div');

    settings_container.id = 'typing_indicator_settings';
    settings_container.className = 'extension_container';

    settings_container.innerHTML = `
        <div class="inline-drawer">

            <div class="inline-drawer-toggle inline-drawer-header">
                <b>💬 Typing Indicator</b>

                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>

            <div class="inline-drawer-content">

                <label class="checkbox_label">

                    <input
                        id="typing_indicator_enabled"
                        type="checkbox"
                    >

                    <span>
                        Activer le typing indicator iMessage
                    </span>

                </label>

                <small>
                    Affiche une bulle iMessage avec trois points animés
                    pendant que le bot génère sa réponse.
                </small>

            </div>

        </div>
    `;

    extensions_settings.appendChild(settings_container);

    const enabled_checkbox = document.querySelector(
        '#typing_indicator_enabled'
    );

    enabled_checkbox.checked = is_enabled();

    enabled_checkbox.addEventListener('change', () => {
        extension_settings[extension_name].enabled =
            enabled_checkbox.checked;

        saveSettingsDebounced();

        if (!enabled_checkbox.checked) {
            remove_typing_indicator(true);
        }

        console.log(
            `[${extension_name}] ${
                enabled_checkbox.checked
                    ? 'Activé'
                    : 'Désactivé'
            }`
        );
    });
}


/* =========================================================
   GENERATION EVENTS
   ========================================================= */

function register_generation_events() {
    if (event_types.GENERATION_STARTED) {
        eventSource.on(
            event_types.GENERATION_STARTED,
            create_typing_indicator
        );
    }

    if (event_types.GENERATION_ENDED) {
        eventSource.on(
            event_types.GENERATION_ENDED,
            remove_typing_indicator
        );
    }

    if (event_types.GENERATION_STOPPED) {
        eventSource.on(
            event_types.GENERATION_STOPPED,
            remove_typing_indicator
        );
    }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

jQuery(async () => {
    load_settings();

    create_settings_ui();

    register_generation_events();

    console.log(
        `[${extension_name}] Extension chargée avec succès.`
    );
});