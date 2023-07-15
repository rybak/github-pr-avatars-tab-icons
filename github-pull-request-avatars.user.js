// ==UserScript==
// @name         GitHub: PR author avatar as tab icon
// @namespace    https://github.com/rybak
// @version      1
// @description  Sets GitHub PR tab icon (favicon) to author's avatar
// @author       Andrei Rybak
// @homepageURL  https://github.com/rybak/github-pr-avatars-tab-icons
// @license      MIT
// @match        https://github.com/*/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

/*
 * Copyright (c) 2023 Andrei Rybak
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * Doesn't work very good, because GitHub's tab icons aren't static.
 * Results of GitHub Actions builds are reflected in the icons dynamically.
 */

(function() {
	'use strict';

	const LOG_PREFIX = '[PR avatars]';

	function error(...toLog) {
		console.error(LOG_PREFIX, ...toLog);
	}

	function warn(...toLog) {
		console.warn(LOG_PREFIX, ...toLog);
	}

	function log(...toLog) {
		console.log(LOG_PREFIX, ...toLog);
	}

	function debug(...toLog) {
		console.debug(LOG_PREFIX, ...toLog);
	}

	/*
	 * Extracts the parts 'owner_repo' and 'pull_number" out of the current page's URL.
	 */
	function getPullRequestUrlParts() {
		/*
		 * URL might be just a PR link:
		 *   https://github.com/rybak/atlassian-tweaks/pull/10
		 * or a subpage of a PR:
		 *   https://github.com/rybak/atlassian-tweaks/pull/10/commits
		 * Result will be
		 *   'rybak/atlassian-tweaks' and '10'
		 */
		const m = document.location.pathname.match("^/(.*)/pull/(\\d+)");
		if (!m) {
			warn("Cannot extract owner_repo and pull_number for REST API URL from", document.location.pathname);
			return null;
		}
		return {
			'owner_repo': m[1],
			'pull_number': m[2]
		};
	}

	function getRestApiPullRequestUrl() {
		const parts = getPullRequestUrlParts();
		if (!parts) {
			return null;
		}
		return `https://api.github.com/repos/${parts.owner_repo}/pulls/${parts.pull_number}`;
	}

	async function setFavicon() {
		const url = getRestApiPullRequestUrl();
		if (!url) {
			return;
		}
		try {
			const response = await fetch(url);
			const json = await response.json();
			const avatarUrl = json.user.avatar_url;

			const shortcutIcon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
			if (avatarUrl && shortcutIcon) {
				shortcutIcon.href = avatarUrl;
			} else {
				warn("Cannot find the shortcut icon");
			}
		} catch (e) {
			error(`Cannot load ${url}. Got error`, e);
		}
	}

	setFavicon();
})();
