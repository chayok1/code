//META{"name":"HideChannels","source":"https://gitlab.com/_Lighty_/bdstuff/blob/master/HideChannels.plugin.js","website":"https://_lighty_.gitlab.io/bdstuff/?plugin=HideChannels"}*//

/*@cc_on
@if (@_jscript)

	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject('WScript.Shell');
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var pathPlugins = shell.ExpandEnvironmentStrings('%APPDATA%\\BetterDiscord\\plugins');
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup('It looks like you\'ve mistakenly tried to run me directly. \n(Don\'t do that!)', 0, 'I\'m a plugin for BetterDiscord', 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup('I\'m in the correct folder already.\nJust reload Discord with Ctrl+R.', 0, 'I\'m already installed', 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup('I can\'t find the BetterDiscord plugins folder.\nAre you sure it\'s even installed?', 0, 'Can\'t install myself', 0x10);
	} else if (shell.Popup('Should I copy myself to BetterDiscord\'s plugins folder for you?', 0, 'Do you need some help?', 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec('explorer ' + pathPlugins);
		shell.Popup('I\'m installed!\nJust reload Discord with Ctrl+R.', 0, 'Successfully installed', 0x40);
	}
	WScript.Quit();

@else@*/

/*
MIT License

Copyright (c) 2017 Arashiryuu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
Custom License

Copyright (c) 2019 Lighty

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, clone, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
If copying a substantial amount of portions of the Software, a link to the
source must be given.
Copying an entire file is forbidden and can only be linked to, unless otherwise
specified.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

var HideChannels = (() => {
	/* Setup */
	const config = {
	  main: 'index.js',
	  info: {
		name: 'HideChannels',
		authors: [
		  {
			name: 'Arashiryuu',
			discord_id: '238108500109033472',
			github_username: 'Arashiryuu',
			twitter_username: ''
		  },
		  {
			name: 'Lighty',
			discord_id: '239513071272329217',
			github_username: 'LightyPon',
			twitter_username: ''
		  }
		],
		version: '1.2.7',
		description: 'Allows you to hide channels. This is a heavy modification of HideUtils by Arashiryuu, added keybind support.',
		github: 'https://gitlab.com/_Lighty_',
		github_raw: 'https://_lighty_.gitlab.io/bdstuff/plugins/HideChannels.plugin.js'
	  },
	  changelog: [{
			title: 'sad',
			type: 'added',
			items: ['Fixed crash if XenoLib or ZeresPluginLib were missing']
		}
	  ]
	};

	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
	  const { Toasts, Patcher, Settings, Utilities, ReactTools, ReactComponents, DiscordModules, DiscordClasses, WebpackModules, DiscordSelectors, PluginUtilities, DiscordAPI } = Api;
	  const { SettingPanel, SettingField, SettingGroup, Keybind, Switch } = Settings;
	  const { ComponentDispatch: Dispatcher } = WebpackModules.getByProps('ComponentDispatch');
	  const { React, ModalStack, ContextMenuActions: MenuActions } = DiscordModules;

	  const unregisterKeybind = WebpackModules.getByProps('inputEventUnregister').inputEventUnregister.bind(ZLibrary.WebpackModules.getByProps('inputEventUnregister'));
	  const registerKeybind = WebpackModules.getByProps('inputEventRegister').inputEventRegister.bind(ZLibrary.WebpackModules.getByProps('inputEventUnregister'));
	  const isChannelMuted = WebpackModules.getByProps('isChannelMuted').isChannelMuted.bind(WebpackModules.getByProps('isChannelMuted'));
	  const updateChannelOverrideSettings = WebpackModules.getByProps('updateChannelOverrideSettings').updateChannelOverrideSettings.bind(WebpackModules.getByProps('updateChannelOverrideSettings'));
	  const selectedVoiceChannel = WebpackModules.getByProps('getVoiceChannelId').getVoiceChannelId;

	  const TextElement = WebpackModules.getByProps('Sizes', 'Weights');
	  const TooltipWrapper = WebpackModules.getByPrototypes('renderTooltip');

	  const has = Object.prototype.hasOwnProperty;
	  const MenuItem = WebpackModules.getByString('disabled', 'brand');
	  const ToggleMenuItem = WebpackModules.getByString('disabled', 'itemToggle');
	  const positionedContainer = WebpackModules.getByProps('positionedContainer');
	  const wrapper = WebpackModules.getByProps('messagesPopoutWrap');
	  const scroller = WebpackModules.getByProps('scrollerWrap');

	  const Button = class Button extends React.Component {
		constructor(props) {
		  super(props);
		  this.onClick = this.onClick.bind(this);
		}

		onClick(e) {
		  if (this.props.action) this.props.action(e);
		}

		render() {
		  const style = this.props.style || {};
		  return React.createElement(
			'button',
			{
			  className: this.props.className || 'button',
			  style,
			  onClick: this.onClick
			},
			this.props.text
		  );
		}
	  };

	  const ItemGroup = class ItemGroup extends React.Component {
		constructor(props) {
		  super(props);
		}

		render() {
		  return React.createElement('div', {
			className: DiscordClasses.ContextMenu.itemGroup.toString(),
			children: this.props.children || []
		  });
		}
	  };

	  const CloseButton = class CloseButton extends React.Component {
		constructor(props) {
		  super(props);
		  this.onClick = this.onClick.bind(this);
		}

		onClick() {
		  if (this.props.onClick) this.props.onClick();
		}

		render() {
		  return React.createElement(
			'svg',
			{
			  className: 'close-button',
			  width: 16,
			  height: 16,
			  viewBox: '0 0 24 24',
			  onClick: this.onClick
			},
			React.createElement('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' }),
			React.createElement('path', { d: 'M0 0h24v24H0z', fill: 'none' })
		  );
		}
	  };

	  const ListText = class ListText extends React.Component {
		constructor(props) {
		  super(props);
		}

		render() {
		  return React.createElement(
			'li',
			{
			  className: 'list-element-item'
			},
			this.props.text
		  );
		}
	  };

	  const ReactUL = class ReactUL extends React.Component {
		constructor(props) {
		  super(props);
		}

		prepareChildren(children) {
		  if (!children.length) return children;
		  return children.map(child => React.createElement(ListText, { text: child }));
		}

		render() {
		  return React.createElement('ul', {
			className: 'list-element',
			children: this.prepareChildren(this.props.children || [])
		  });
		}
	  };

	  const Modal = class Modal extends React.Component {
		constructor(props) {
		  super(props);
		  this._labels = {
			Channels: 'ID: {{id}}\nGuild: {{guild}}\nChannel: {{channel}}',
			Categories: 'ID: {{id}}\nGuild: {{guild}}\nCategory: {{category}}'
		  };
		  this.close = this.close.bind(this);
		  this.replaceLabels = this.replaceLabels.bind(this);
		}

		close() {
		  ModalStack.popWithKey('HideChannels-SettingsModal');
		}

		replaceLabels(label, data) {
		  if (!has.call(this._labels, label)) return null;

		  const string = this._labels[label];

		  if (label === 'Categories')
			return string
			  .replace(/{{id}}/, data.id)
			  .replace(/{{guild}}/, data.guild)
			  .replace(/{{category}}/, data.name);

		  return string
			.replace(/{{id}}/, data.id)
			.replace(/{{guild}}/, data.guild)
			.replace(/{{channel}}/, data.name);
		}

		render() {
		  const label = this.props.name;
		  const data = [];

		  if (this.props.data) {
			for (const entry of Object.values(this.props.data)) {
			  if (Array.isArray(entry)) continue;

			  const item = React.createElement(TooltipWrapper, {
				text: this.replaceLabels(label, entry),
				color: TooltipWrapper.Colors.BLACK,
				position: TooltipWrapper.Positions.TOP,
				children: props => {
				  const type = label.slice(0, -1);

				  return React.createElement(
					'div',
					Object.assign(
					  {
						className: 'buttonWrapper'
					  },
					  props
					),
					React.createElement(Button, {
					  text: entry.name ? entry.name : entry.tag,
					  className: `${type.toLowerCase()}-button`,
					  action: () => {
						Dispatcher.dispatch(`HIDECHANNELS_BUTTON_${type.toUpperCase()}CLEAR`, entry.id);
						this.forceUpdate();
					  }
					})
				  );
				}
			  });

			  data.push(item);
			}

			const count = TextElement.default({
			  weight: TextElement.Weights.BOLD,
			  color: TextElement.Colors.BRAND,
			  size: TextElement.Sizes.MEDIUM,
			  style: {
				textTransform: 'uppercase',
				borderBottom: '2px solid currentColor',
				marginBottom: '4px'
			  },
			  children: [label, ' hidden \u2014 ', data.length]
			});

			data.unshift(count, React.createElement('hr', { style: { border: 'none' } }));
		  } else {
			data.push(
			  React.createElement(
				'div',
				{
				  id: 'HideChannels-Instructions',
				  className: 'instructions'
				},
				TextElement.default({
				  color: TextElement.Colors.PRIMARY,
				  children: [
					TextElement.default({
					  weight: TextElement.Weights.BOLD,
					  color: TextElement.Colors.BRAND,
					  size: TextElement.Sizes.MEDIUM,
					  style: {
						textTransform: 'uppercase',
						borderBottom: '2px solid currentColor',
						marginBottom: '4px'
					  },
					  children: ['How to']
					}),
					React.createElement(ReactUL, {
					  children: ['Right-click on a channel.', 'Left-click the hide option in the context-menu.']
					}),
					React.createElement('br', {}),
					TextElement.default({
					  weight: TextElement.Weights.BOLD,
					  color: TextElement.Colors.BRAND,
					  size: TextElement.Sizes.MEDIUM,
					  style: {
						textTransform: 'uppercase',
						borderBottom: '2px solid currentColor',
						marginBottom: '4px'
					  },
					  children: ['Note']
					}),
					React.createElement(ReactUL, {
					  children: ['Unhiding requires use of the settings-panel, and is not handled within a context-menu.', 'Click on a hidden element in its respective settings modal to unhide it.']
					})
				  ]
				})
			  )
			);
		  }

		  return React.createElement(
			'div',
			{
			  id: 'HideChannels-Modal',
			  className: `${wrapper.messagesPopoutWrap} ${DiscordClasses.Popouts.themedPopout}`
			},
			React.createElement(
			  'div',
			  {
				id: 'HideChannels-Header',
				className: `${wrapper.header} ${DiscordClasses.Popouts.header}`
			  },
			  React.createElement(CloseButton, {
				onClick: this.close
			  }),
			  TextElement.default({
				className: wrapper.title,
				color: TextElement.Colors.PRIMARY,
				children: ['HideChannels \u2014 ', label]
			  })
			),
			React.createElement(
			  'div',
			  {
				className: scroller.scrollerWrap
			  },
			  React.createElement('div', {
				className: `${scroller.scroller} ${scroller.systemPad} ${wrapper.messagesPopout}`,
				scrollable: true,
				children: data
			  })
			)
		  );
		}
	  };

	  const Select = class Select extends React.Component {
		constructor(props) {
		  super(props);
		  this.openInstructions = this.openInstructions.bind(this);
		  this.openChannels = this.openChannels.bind(this);
		  this.openCategories = this.openCategories.bind(this);
		}

		openChannels() {
		  ModalStack.push(Modal, { name: 'Channels', data: this.props.channels }, 'HideChannels-SettingsModal');
		}

		openCategories() {
		  ModalStack.push(Modal, { name: 'Categories', data: this.props.categories }, 'HideChannels-SettingsModal');
		}

		openInstructions() {
		  ModalStack.push(Modal, { name: 'Instructions', data: null }, 'HideChannels-SettingsModal');
		}

		render() {
		  return React.createElement(
			'div',
			{
			  id: 'HideChannels-Settings',
			  className: 'HUSettings'
			},
			React.createElement(
			  'div',
			  {
				id: 'Setting-Select',
				className: 'container'
			  },
			  React.createElement(
				'h3',
				{
				  className: 'settingsHeader'
				},
				React.createElement(
				  'div',
				  {
					id: 'HideChannels-ButtonGroup',
					className: 'buttonGroup'
				  },
				  React.createElement(Button, {
					text: 'Channels',
					action: this.openChannels
				  }),
				  React.createElement(Button, {
					text: 'Categories',
					action: this.openCategories
				  }),
				  React.createElement(Button, {
					text: 'Instructions',
					action: this.openInstructions
				  })
				)
			  )
			)
		  );
		}
	  };

	  const SelectionField = class SelectionField extends SettingField {
		constructor(name, note, data, onChange) {
		  super(name, note, onChange, Select, {
			channels: data.channels,
			categories: data.categories
		  });
		}
	  };

	  return class HideChannels extends Plugin {
		constructor() {
		  super();
		  this._css;
		  this.promises = {
			state: { cancelled: false },
			cancel() {
			  this.state.cancelled = true;
			},
			restore() {
			  this.state.cancelled = false;
			}
		  };
		  this.hideKeyDown = false;
		  this.muteKeyDown = false;
		  this.default = {
			channels: {},
			servers: { unhidden: [] },
			categories: {},
			enableHideKeybind: true,
			hideKeybind: [],
			enableMuteKeybind: true,
			muteKeybind: [],
			enableShowHiddenKeybind: true,
			toggleShowHiddenKeybind: []
		  };
		  this.settings = Utilities.deepclone(this.default);
		  this.css = `
							.theme-light #HideChannels-Header .close-button {
								fill: #72767d;
							}
							#HideChannels-Header .close-button {
								fill: white;
								cursor: pointer;
								opacity: 0.6;
								float: right;
								transition: opacity 200ms ease;
							}
							#HideChannels-Header .close-button:hover {
								opacity: 1;
							}
							#HideChannels-Settings {
								overflow-x: hidden;
							}
							#HideChannels-Settings h3 {
								text-align: center;
								color: #CCC;
							}
							#HideChannels-Settings #HideChannels-ButtonGroup .button {
								background: #7289DA;
								color: #FFF;
								border-radius: 5px;
								margin: 5px;
								height: 30px;
								width: auto;
								min-width: 6vw;
								padding: 0 1vw;
							}
							#HideChannels-Settings button,
							.buttonWrapper button {
								background: #7289DA;
								color: #FFF;
								width: 5vw;
								height: 30px;
								border-radius: 5px;
								padding: 0;
								font-size: 14px;
							}
							.buttonWrapper {
								display: inline-block;
								margin: 5px;
								overflow-y: auto;
							}
							.buttonWrapper button {
								/*overflow: hidden;
								width: 5vw;
								height: 30px;
								word-break: break-word;
								white-space: nowrap;
								text-overflow: ellipsis;*/
								min-height: 5vh;
								min-width: 5vw;
								height: 5vh;
								width: auto;
								max-height: 10vh;
								max-width: 10vw;
								font-size: 10pt;
								word-break: break-word;
								word-wrap: break-word;
								text-overflow: ellipsis;
								padding: 0 5px;
								display: flex;
								justify-content: center;
								overflow: hidden;
							}
							#HideChannels-Settings .icons .container::-webkit-scrollbar {
								width: 7px !important;
								background: rgba(0, 0, 0, 0.4);
							}
							#HideChannels-Settings .icons .container::-webkit-scrollbar-thumb {
								min-height: 20pt !important;
								min-width: 20pt !important;
								background: rgba(255, 255, 255, 0.6) !important;
							}
							#HideChannels-Instructions .list-element {
								margin: 8px 0 8px 6px;
							}
							#HideChannels-Instructions .list-element-item {
								position: relative;
								margin-left: 15px;
								margin-bottom: 8px;
							}
							#HideChannels-Instructions .list-element-item:last-child {
								margin-bottom: 0;
							}
							#HideChannels-Instructions .list-element-item::before {
								content: '';
								position: absolute;
								background: #dcddde;
								top: 10px;
								left: -15px;
								width: 6px;
								height: 6px;
								margin-top: -4px;
								margin-left: -3px;
								border-radius: 50%;
								opacity: 0.3;
							}
						`;

		  this.handleContextMenu = this.handleContextMenu.bind(this);
		  this.chanClear = this.chanClear.bind(this);
		  this.chanPush = this.chanPush.bind(this);
		  this.catClear = this.catClear.bind(this);
		  this.catPush = this.catPush.bind(this);
		  this.channel;
		}

		/* Methods */

		setup() {
		  this.guild = DiscordModules.GuildStore.getGuild;
		  this.channel = DiscordModules.ChannelStore.getChannel;
		}

		subscribe() {
		  Dispatcher.subscribe('HIDECHANNELS_BUTTON_CHANNELCLEAR', this.chanClear);
		  Dispatcher.subscribe('HIDECHANNELS_BUTTON_CATEGORIECLEAR', this.catClear);
		}

		unsubscribe() {
		  Dispatcher.unsubscribe('HIDECHANNELS_BUTTON_CHANNELCLEAR', this.chanClear);
		  Dispatcher.unsubscribe('HIDECHANNELS_BUTTON_CATEGORIECLEAR', this.catClear);
		}

		onStart() {
		  this.promises.restore();
		  PluginUtilities.addStyle(this.short, this.css);
		  this.setup();
		  this.loadSettings(this.settings);
		  this.subscribe();
		  this.patchAll(this.promises.state);
		  this.registerKeybinds();
		}

		onStop() {
		  this.promises.cancel();
		  PluginUtilities.removeStyle(this.short);
		  this.unsubscribe();
		  Patcher.unpatchAll();
		  XenoLib.unpatchContext(this.handleContextMenu);
		  this.updateAll();
		  this.unregisterKeybinds();
		}

		patchAll(promiseState) {
		  this.patchChannels(promiseState);
		  XenoLib.patchContext(this.handleContextMenu);
		  this.patchIsMentioned(promiseState);
		  this.patchReceiveMessages(promiseState);
		  this.patchSelectChannel(promiseState);
		  this.patchTextChannelClick(promiseState);
		  this.patchVoiceChannelClick(promiseState);
		  this.patchCategoryCollapse(promiseState);
		}

		updateAll() {
		  this.updateChannels();
		  this.updateContextMenu();
		}

		reRegisterKeybinds() {
		  this.unregisterKeybinds();
		  this.registerKeybinds();
		}

		unregisterKeybinds() {
		  unregisterKeybind('69420');
		  unregisterKeybind('69421');
		  unregisterKeybind('69422');
		}
		registerKeybinds() {
		  registerKeybind('69420', this.settings.hideKeybind, e => (this.hideKeyDown = e), {
			blurred: false,
			focused: false,
			keydown: true,
			keyup: true
		  });
		  registerKeybind('69421', this.settings.muteKeybind, e => (this.muteKeyDown = e), {
			blurred: false,
			focused: false,
			keydown: true,
			keyup: true
		  });
		  registerKeybind(
			'69422',
			this.settings.toggleShowHiddenKeybind,
			() => {
			  if (!this.settings.enableShowHiddenKeybind || !DiscordAPI.currentGuild) return;
			  this.servUnhideChannels(DiscordAPI.currentGuild.id);
			  Toasts.info(`Hidden channels ${this.settings.servers.unhidden.includes(DiscordAPI.currentGuild.id) ? 'shown' : 'hidden'}!`, { timeout: 3e3 });
			},
			{
			  blurred: false,
			  focused: true,
			  keydown: true,
			  keyup: false
			}
		  );
		}

		patchSelectChannel() {
		  Patcher.instead(WebpackModules.getByProps('selectVoiceChannel'), 'selectVoiceChannel', (that, args, value) => {
			const channelId = args[0];
			if (this.onClickHandler(channelId)) return;
			return value(...args);
		  });
		  Patcher.instead(WebpackModules.getByProps('selectChannel'), 'selectChannel', (that, args, value) => {
			const channelId = args[1];
			if (this.onClickHandler(channelId)) return;
			return value(...args);
		  });
		}

		async patchCategoryCollapse(promiseState) {
		  const Category = await ReactComponents.getComponentByName('Category', '.' + WebpackModules.getByProps('addButtonIcon', 'containerDefault').containerDefault.split(' ')[0]);
		  if (promiseState.cancelled) return;
		  Patcher.after(Category.component.prototype, 'render', (that, args, value) => {
			const categoryId = this.getProps(that, 'props.channel.id');
			const props = this.getProps(value, 'props.children.props');
			if (!categoryId || !props) return;
			const old = !props.tutorialId && props.onClick;
			if (!old) return;
			props.onClick = () => {
			  const handleHide = () => {
				if (!this.settings.enableHideKeybind || !this.hideKeyDown || !DiscordAPI.currentGuild) return false;
				if (has.call(this.settings.categories, categoryId)) {
				  this.catClear(categoryId);
				} else {
				  this.catPush(categoryId);
				}
				return true;
			  };
			  const handleMute = () => {
				if (!this.settings.enableMuteKeybind || !this.muteKeyDown || !DiscordAPI.currentGuild) return false;
				const isMuted = isChannelMuted(DiscordAPI.currentGuild.id, categoryId);
				updateChannelOverrideSettings(DiscordAPI.currentGuild.id, categoryId, {
				  muted: !isMuted
				});
				Toasts.info(`Category ${isMuted ? 'unmuted' : 'muted'}!`, { timeout: 3e3 });
				return true;
			  };
			  if (handleHide() || handleMute()) return;
			  return old();
			};
		  });
		  Category.forceUpdateAll();
		}

		patchReceiveMessages() {
		  Patcher.instead(DiscordModules.MessageActions, 'receiveMessage', (that, args, value) => {
			const [channelId, { author }] = args;
			const channel = this.channel(channelId); // TODO: this is buggy
			if (has.call(this.settings.channels, channelId)) return false;
			return value.apply(that, args);
		  });
		}

		patchIsMentioned() {
		  const Module = WebpackModules.getByProps('isMentioned');
		  Patcher.instead(Module, 'isMentioned', (that, args, value) => {
			const [{ channel_id }] = args;
			if (has.call(this.settings.channels, channel_id)) return false;
			return value.apply(that, args);
		  });
		}

		handleContextMenu(_this, ret) {
		  if (!ret) return ret;
		  const type = _this.props.type;
		  if (!type) return;
		  if (type.startsWith('GUILD_')) {
			const orig = this.getProps(ret, 'props');
			const props = this.getProps(_this, 'props');
			const id = this.getProps(props, 'guild.id');
			const active = this.settings.servers.unhidden.indexOf(id) !== -1;

			if (!orig && !id) return;

			const unhideItem = new ToggleMenuItem({
			  label: 'Unhide Channels',
			  active: active,
			  action: () => {
				this.servUnhideChannels(id);
			  }
			});

			const clearItem = new MenuItem({
			  label: 'Purge Hidden Channels',
			  danger: true,
			  action: () => {
				MenuActions.closeContextMenu();
				this.chanPurge(id);
			  }
			});

			const children = id ? [unhideItem, clearItem] : [];

			const group = React.createElement(ItemGroup, { children: children });

			if (Array.isArray(orig.children)) orig.children.unshift(group);
			else orig.children = [group, orig.children];

			//setImmediate(() => this.updateContextPosition(_this));
		  } else if (type.startsWith('CHANNEL_')) {
			if (!_this.props.type.startsWith('CHANNEL_LIST_') && _this.props.type !== 'CHANNEL_CATEGORY') return;
			const channel = this.getProps(_this, 'props.channel');

			const orig = this.getProps(ret, 'props');
			let itemProps;

			if (_this.props.type !== 'CHANNEL_CATEGORY') {
			  const isHidden = has.call(this.settings.channels, channel.id);
			  itemProps = {
				label: isHidden ? 'Unhide' : 'Hide' + ' Channel',
				action: () => {
				  MenuActions.closeContextMenu();
				  (isHidden ? this.chanClear : this.chanPush)(channel.id);
				}
			  };
			} else {
			  const isHidden = has.call(this.settings.categories, channel.id);
			  itemProps = {
				label: isHidden ? 'Unhide' : 'Hide' + ' Category',
				action: () => {
				  MenuActions.closeContextMenu();
				  (isHidden ? this.catClear : this.catPush)(channel.id);
				}
			  };
			}

			const item = new MenuItem(itemProps);
			const group = React.createElement(ItemGroup, { children: [item] });

			if (Array.isArray(orig.children)) orig.children.unshift(group);
			else orig.children = [group, orig.children];

			//setImmediate(() => this.updateContextPosition(_this)); /* hm? */
		  }
		}

		updateContextMenu() {
		  const menus = document.querySelectorAll(DiscordSelectors.ContextMenu.contextMenu.toString());
		  for (let i = 0, len = menus.length; i < len; i++) ReactTools.getOwnerInstance(menus[i]).forceUpdate();
		}

		updateContextPosition(m) {
		  if (!m) return;

		  let height = this.getProps(m, 'props.onHeightUpdate');
		  if (!height) height = this.getProps(m, '_reactInternalFiber.return.memoizedProps.onHeightUpdate');

		  height && height();
		}

		patchChannels() {
		  const Channels = WebpackModules.getByDisplayName('Channels');
		  Patcher.after(Channels.prototype, 'renderList', (that, args, value) => {
			if (this.settings.servers.unhidden.indexOf(that.props.guildId) !== -1) return value;
			const old = value.props.rowHeight;
			value.props.rowHeight = (category, channelIndex) => {
			  if (this.settings.servers.unhidden.indexOf(that.props.guildId) === -1) {
				const cat = that.props.channels[4][category];
				if (cat) {
				  if (has.call(this.settings.categories, cat.channel.id)) return 0;
				  const channel = that.props.categories[cat.channel.id][channelIndex];
				  if (channel && has.call(this.settings.channels, channel.channel.id)) return 0;
				}
			  }
			  return old(category, channelIndex);
			};
			const old2 = value.props.sectionHeight;
			value.props.sectionHeight = category => {
			  if (this.settings.servers.unhidden.indexOf(that.props.guildId) === -1) {
				const cat = that.props.channels[4][category];
				if (cat && category) {
				  if (has.call(this.settings.categories, cat.channel.id)) return 0;
				  let visibleChannels = 0;
				  that.props.categories[cat.channel.id].forEach(chan => {
					if (chan && has.call(this.settings.channels, chan.channel.id)) return;
					visibleChannels++;
				  });
				  if (!visibleChannels) return 0;
				}
			  }
			  return old2(category);
			};
		  });
		  const VerticalScroller = WebpackModules.getByDisplayName('VerticalScroller');
		  Patcher.after(VerticalScroller.prototype, 'render', (that, args, value) => {
			const children = this.getProps(value, 'props.children.0.props.children.1.2');
			if (!children || !Array.isArray(children)) return value;
			const guildId = this.getProps(children, '0.1.props.channel.guild_id') || this.getProps(children, '0.0.props.guild.id');
			if (this.settings.servers.unhidden.indexOf(guildId) !== -1) return value;
			for (let i = 0, len = children.length; i < len; i++) {
			  if (!children[i] || !Array.isArray(children[i])) continue;
			  let isCategory = children[i][0].type.displayName && children[i][0].type.displayName.indexOf('Category') !== -1;
			  // If the category naturally has no children, do not unrender
			  if (children[i].length === 3 && isCategory && children[i][0].props.isEmpty) continue;
			  if (isCategory) {
				if (has.call(this.settings.categories, children[i][0].key)) {
				  delete children[i];
				  i--;
				  continue;
				}
			  }
			  children[i] = children[i].filter(channel => {
				if (!channel) return channel;
				const props = this.getProps(channel, 'props');
				return !channel.key || (channel.key && !has.call(this.settings.channels, channel.key));
			  });
			  // If we hide all children of a category, unrender it
			  if (children[i].length === 1 && isCategory) {
				children[i][0] = null;
			  }
			}
			return value;
		  });
		  this.updateChannels();
		}

		onClickHandler(chanId) {
		  const handleHide = () => {
			if (!this.settings.enableHideKeybind || !this.hideKeyDown || !DiscordAPI.currentGuild) return false;
			if (has.call(this.settings.channels, chanId)) {
			  this.chanClear(chanId);
			} else {
			  this.chanPush(chanId);
			}
			return true;
		  };
		  const handleMute = () => {
			if (!this.settings.enableMuteKeybind || !this.muteKeyDown || !DiscordAPI.currentGuild) return false;
			const isMuted = isChannelMuted(DiscordAPI.currentGuild.id, chanId);
			updateChannelOverrideSettings(DiscordAPI.currentGuild.id, chanId, {
			  muted: !isMuted
			});
			Toasts.info(`Channel ${isMuted ? 'unmuted' : 'muted'}!`, { timeout: 3e3 });
			return true;
		  };
		  return handleHide() || handleMute();
		}

		async patchTextChannelClick(promiseState) {
		  const TextChannel = await ReactComponents.getComponentByName('TextChannel', '.' + WebpackModules.getByProps('containerDefault').containerDefault.split(' ')[0]);
		  if (promiseState.cancelled) return;
		  Patcher.after(TextChannel.component.prototype, 'render', (that, args, value) => {
			const chanId = this.getProps(that, 'props.channel.id');
			const selected = this.getProps(that, 'props.selected');
			if (!selected) return;
			value.props.onClick = () => this.onClickHandler(chanId);
		  });
		  TextChannel.forceUpdateAll();
		}

		async patchVoiceChannelClick(promiseState) {
		  const VoiceChannel = await ReactComponents.getComponentByName('VoiceChannel', '.' + WebpackModules.getByProps('containerDefault').containerDefault.split(' ')[0]);
		  if (promiseState.cancelled) return;
		  Patcher.after(VoiceChannel.component.prototype, 'render', (that, args, value) => {
			const chanId = this.getProps(that, 'props.channel.id');
			if (!chanId || (chanId !== selectedVoiceChannel() && !this.getProps(that, 'props.locked'))) return;
			value.props.onClick = () => this.onClickHandler(chanId);
		  });
		  VoiceChannel.forceUpdateAll();
		}

		updateChannels() {
		  const channels = document.querySelector(`.${positionedContainer.positionedContainer.replace(/\s/, '.')}`);
		  if (channels) ReactTools.getOwnerInstance(channels).forceUpdate();
		}

		clearUnhiddenChannels(id) {
		  if (!id || !this.settings.servers.unhidden.includes(id)) return false;
		  this.settings.servers.unhidden.splice(this.settings.servers.unhidden.indexOf(id), 1);
		  return true;
		}

		pushToUnhiddenChannels(id) {
		  if (!id || this.settings.servers.unhidden.includes(id)) return false;
		  this.settings.servers.unhidden.push(id);
		  return true;
		}

		servUnhideChannels(id) {
		  if (!id) return;
		  if (!this.clearUnhiddenChannels(id) && !this.pushToUnhiddenChannels(id)) return;

		  this.saveSettings(this.settings);
		  this.updateAll();
		}

		chanPush(id) {
		  if (!id) return;
		  if (has.call(this.settings.channels, id)) return Toasts.info('This channel is already being hidden.', { timeout: 3e3 });
		  const channel = this.channel(id);
		  if (!channel) return Toasts.info('Unable to find channel to hide.', { timeout: 3e3 });
		  const guild = this.guild(channel.guild_id);
		  this.settings.channels[id] = {
			id: channel.id,
			name: channel.name,
			guild: guild.name
		  };
		  Toasts.info('Channel has successfully been hidden.', { timeout: 3e3 });
		  this.saveSettings(this.settings);
		  this.updateAll();
		}

		chanPurge(guildId) {
		  const guild = this.guild(guildId);
		  const predicate = chan => {
			const c = this.channel(chan.id);
			if (!c) return false;
			return c.guild_id === guildId;
		  };
		  const channels = Object.values(this.settings.channels).filter(predicate);
		  const categories = Object.values(this.settings.categories).filter(predicate);
		  for (const channel of channels) delete this.settings.channels[channel.id];
		  for (const category of categories) delete this.settings.categories[category.id];
		  Toasts.info(`Channel purge for ${guild.name.trim()} was successful.`, { timeout: 3e3 });
		  this.saveSettings(this.settings);
		  this.updateAll();
		}

		chanClear(id) {
		  if (!id) return;
		  if (!has.call(this.settings.channels, id)) return Toasts.info('This channel is not currently being hidden.', { timeout: 3e3 });
		  delete this.settings.channels[id];
		  Toasts.info('Channel successfully removed.', { timeout: 3e3 });
		  this.saveSettings(this.settings);
		  this.updateAll();
		}

		catPush(id) {
		  if (!id) return;
		  if (has.call(this.settings.categories, id)) return Toasts.info('This category is already being hidden.', { timeout: 3e3 });
		  const category = this.channel(id);
		  if (!category) return Toasts.info('Unable to find category to hide.', { timeout: 3e3 });
		  const guild = this.guild(category.guild_id);
		  this.settings.categories[id] = {
			id: category.id,
			name: category.name,
			guild: guild.name
		  };
		  Toasts.info('Category has successfully been hidden.', { timeout: 3e3 });
		  this.saveSettings(this.settings);
		  this.updateAll();
		}

		catClear(id) {
		  if (!id) return;
		  if (!has.call(this.settings.categories, id)) return Toasts.info('This category is not currently being hidden.', { timeout: 3e3 });
		  delete this.settings.categories[id];
		  Toasts.info('Category successfully removed.', { timeout: 3e3 });
		  this.saveSettings(this.settings);
		  this.updateAll();
		}

		/**
		 * @name safelyGetNestedProps
		 * @author Zerebos
		 */
		getProps(obj, path) {
		  return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
		}

		/* Settings Panel */

		getSettingsPanel() {
		  return SettingPanel.build(
			() => this.saveSettings(this.settings),
			new SettingGroup('Plugin Settings').append(
			  new SelectionField('HideChannel Setting Select', 'Select which settings you would like to visit.', this.settings, () => {}),
			  new Switch('Enable hide keybind', '', this.settings.enableHideKeybind, e => (this.settings.enableHideKeybind = e)),
			  new Keybind(
				'Hide keybind',
				'Click on a channel to hide it.',
				this.settings.hideKeybind.map(e => e[1]),
				e => {
				  const keybind = [];
				  e.forEach(e => {
					keybind.push([0, e]);
				  });
				  this.settings.hideKeybind = keybind;
				  this.reRegisterKeybinds();
				}
			  ),
			  new Switch('Enable mute keybind', '', this.settings.enableMuteKeybind, e => (this.settings.enableMuteKeybind = e)),
			  new Keybind(
				'Mute keybind',
				'Click on a channel to mute it.',
				this.settings.muteKeybind.map(e => e[1]),
				e => {
				  const keybind = [];
				  e.forEach(e => {
					keybind.push([0, e]);
				  });
				  this.settings.muteKeybind = keybind;
				  this.reRegisterKeybinds();
				}
			  ),
			  new Switch('Enable show hidden channels keybind', '', this.settings.enableShowHiddenKeybind, e => (this.settings.enableShowHiddenKeybind = e)),
			  new Keybind(
				'Toggle show hidden channels keybind',
				'',
				this.settings.toggleShowHiddenKeybind.map(e => e[1]),
				e => {
				  const keybind = [];
				  e.forEach(e => {
					keybind.push([0, e]);
				  });
				  this.settings.toggleShowHiddenKeybind = keybind;
				  this.reRegisterKeybinds();
				}
			  )
			)
		  );
		}

		/* Setters */

		set css(style = '') {
		  return (this._css = style
			.split(/\s+/g)
			.join(' ')
			.trim());
		}

		/* Getters */

		get [Symbol.toStringTag]() {
		  return 'Plugin';
		}

		get css() {
		  return this._css;
		}

		get name() {
		  return config.info.name;
		}

		get short() {
		  let string = '';

		  for (let i = 0, len = config.info.name.length; i < len; i++) {
			const char = config.info.name[i];
			if (char === char.toUpperCase()) string += char;
		  }

		  return string;
		}

		get author() {
		  return config.info.authors.map(author => author.name).join(', ');
		}

		get version() {
		  return config.info.version;
		}

		get description() {
		  return config.info.description;
		}
	  };
	};

	/* Finalize */

	return !global.ZeresPluginLibrary || !global.XenoLib
	  ? class {
		  getName() {
			return this.name.replace(/\s+/g, '');
		  }

		  getAuthor() {
			return this.author;
		  }

		  getVersion() {
			return this.version;
		  }

		  getDescription() {
			return this.description;
		  }

		  stop() {}
		  load() {
			const ezlibMissing = !global.XenoLib;
			const zlibMissing = !global.ZeresPluginLibrary;
			const bothLibsMissing = ezlibMissing && zlibMissing;
			const header = `Missing ${(bothLibsMissing && 'Libraries') || 'Library'}`;
			const content = `The ${(bothLibsMissing && 'Libraries') || 'Library'} ${(zlibMissing && 'ZeresPluginLibrary') || ''} ${(ezlibMissing && (zlibMissing ? 'and XenoLib' : 'XenoLib')) || ''} required for ${this.name} ${(bothLibsMissing && 'are') || 'is'} missing.`;
			const ModalStack = BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey');
			const TextElement = BdApi.findModuleByProps('Sizes', 'Weights');
			const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() === 'confirm-modal');
			const onFail = () => BdApi.getCore().alert(header, `${content}<br/>Due to a slight mishap however, you'll have to download the libraries yourself. After opening the links, do CTRL + S to download the library.<br/>${(zlibMissing && '<br/><a href="https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"target="_blank">Click here to download ZeresPluginLibrary</a>') || ''}${(zlibMissing && '<br/><a href="http://localhost:7474/XenoLib.js"target="_blank">Click here to download XenoLib</a>') || ''}`);
			if (!ModalStack || !ConfirmationModal || !TextElement) return onFail();
			ModalStack.push(props => {
			  return BdApi.React.createElement(
				ConfirmationModal,
				Object.assign(
				  {
					header,
					children: [BdApi.React.createElement(TextElement, { color: TextElement.Colors.PRIMARY, children: [`${content} Please click Download Now to install ${(bothLibsMissing && 'them') || 'it'}.`] })],
					red: false,
					confirmText: 'Download Now',
					cancelText: 'Cancel',
					onConfirm: () => {
					  const request = require('request');
					  const fs = require('fs');
					  const path = require('path');
					  const waitForLibLoad = callback => {
						if (!global.BDEvents) return callback();
						const onLoaded = e => {
						  if (e !== 'ZeresPluginLibrary') return;
						  BDEvents.off('plugin-loaded', onLoaded);
						  callback();
						};
						BDEvents.on('plugin-loaded', onLoaded);
					  };
					  const onDone = () => {
						if (!global.pluginModule || (!global.BDEvents && !global.XenoLib)) return;
						if (!global.BDEvents || global.XenoLib) pluginModule.reloadPlugin(this.name);
						else {
						  const listener = () => {
							pluginModule.reloadPlugin(this.name);
							BDEvents.off('xenolib-loaded', listener);
						  };
						  BDEvents.on('xenolib-loaded', listener);
						}
					  };
					  const downloadXenoLib = () => {
						if (global.XenoLib) return onDone();
						request('https://raw.githubusercontent.com/1Lighty/BetterDiscordPlugins/master/Plugins/1XenoLib.plugin.js', (error, response, body) => {
						  if (error) return onFail();
						  onDone();
						  fs.writeFile(path.join(window.ContentManager.pluginsFolder, '1XenoLib.plugin.js'), body, () => {});
						});
					  };
					  if (!global.ZeresPluginLibrary) {
						request('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', (error, response, body) => {
						  if (error) return onFail();
						  waitForLibLoad(downloadXenoLib);
						  fs.writeFile(path.join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, () => {});
						});
					  } else downloadXenoLib();
					}
				  },
				  props
				)
			  );
			});
		  }

		  start() {}

		  /* Getters */

		  get [Symbol.toStringTag]() {
			return 'Plugin';
		  }

		  get name() {
			return config.info.name;
		  }

		  get short() {
			let string = '';

			for (let i = 0, len = config.info.name.length; i < len; i++) {
			  const char = config.info.name[i];
			  if (char === char.toUpperCase()) string += char;
			}

			return string;
		  }

		  get author() {
			return config.info.authors.map(author => author.name).join(', ');
		  }

		  get version() {
			return config.info.version;
		  }

		  get description() {
			return config.info.description;
		  }
		}
	  : buildPlugin(global.ZeresPluginLibrary.buildPlugin(config));
  })();

  /*@end@*/
