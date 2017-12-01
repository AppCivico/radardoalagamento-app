/* eslint-disable react/prop-types, class-methods-use-this, array-callback-return */
import React from 'react';
import { connect } from 'react-redux';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

import { mapStateToProps, mapDispatchToProps } from '../store';

import Header from '../components/Header';
import Drawer from '../components/Drawer';

import { colors } from '../styles/variables';

import attention from '../assets/images/icon-attention.png';
import alert from '../assets/images/icon-alert.png';
import overflow from '../assets/images/icon-overflow.png';
import emergency from '../assets/images/icon-emergency.png';
import background from '../assets/images/elements_bg.png';
import wink from '../assets/images/wink.png';

const style = StyleSheet.create({
	container: {
		flex: 1,
	},
	menu: {
		backgroundColor: colors.blue,
		flexDirection: 'row',
	},
	menuItem: {
		flex: 2,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	activeMenu: {
		borderBottomWidth: 4,
		borderBottomColor: colors.blue2,
	},
	menuText: {
		color: '#fff',
		fontFamily: 'raleway',
		fontSize: 18,
	},
	containerNotifications: {
		flex: 1,
		paddingLeft: 30,
		paddingRight: 30,
	},
	notification: {
		marginTop: 30,
	},
	card: {
		backgroundColor: '#fff',
		display: 'flex',
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: colors.grayLight,
		marginTop: 1,
	},
	cardIcon: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 5,
	},
	cardIconImage: {
		width: 40,
		height: 40,
		resizeMode: 'contain',
	},
	cardText: {
		flex: 5,
		paddingTop: 25,
		paddingLeft: 15,
		paddingBottom: 25,
		paddingRight: 15,
		justifyContent: 'flex-start',
	},
	cardDescription: {
		fontFamily: 'ralewayBold',
		fontSize: 18,
		color: colors.gray,
	},
	date: {
		fontFamily: 'raleway',
		fontSize: 14,
		color: colors.grayLight,
	},
	wink: {
		flex: 1,
		resizeMode: 'contain',
		width: '40%',
		height: 'auto',
		alignSelf: 'center',
	},
	warning: {
		fontFamily: 'ralewayBold',
		fontSize: 22,
		marginBottom: 10,
		textAlign: 'center',
		color: '#5d5d5d',
	},
	background: {
		flex: 1,
		resizeMode: 'contain',
		width: '100%',
		height: 'auto',
		alignSelf: 'flex-end',
	},
});

class Notifications extends React.Component {
	constructor() {
		super();
		this.state = {
			isLoaded: false,
			menu: false,
			notifications: [],
			colors: {
				attention: '#f6dc35',
				alert: '#f1a225',
				overflow: '#f6dc35',
				emergency: '#f54f4f',
			},
			activeMenu: true,
		};
		this.toggleMenu = this.toggleMenu.bind(this);
		this.changeRoute = this.changeRoute.bind(this);
		this.getNotifications = this.getNotifications.bind(this);
		this.changeAlerts = this.changeAlerts.bind(this);
	}

	componentWillMount() {
		this.getNotifications('user');
	}

	getNotifications(type) {
		const url = type === 'city' ? 'all' : '';
		fetch(`https://dtupa.eokoe.com/alert/${url}?api_key=7322f9c2-5855-42f0-9f31-667c60de76c8`)
			.then(response => response.json())
			.then((data) => {
				const notifications = data.results;
				const isLoaded = true;
				this.setState({ notifications, isLoaded });
			})
			.catch(err => console.error(err));
	}

	toggleMenu() {
		const menu = !this.state.menu;
		this.setState({ menu });
	}

	changeRoute(route) {
		this.props.navigation.navigate(route);
	}

	changeAlerts(type) {
		const activeMenu = !this.state.activeMenu;
		this.setState({ activeMenu });
		this.getNotifications(type);
	}

	formatDate(date) {
		if (date) {
			const day = date
				.split(' ')[0]
				.split('-')
				.reverse()
				.join('.');

			const hour = date.split(' ')[1].split(':');

			return `${day} às ${hour[0]}h${hour[1]}`;
		}

		return date;
	}

	preRenderNotifications() {
		if (this.state.notifications.length > 0) {
			return this.renderAllNotifications();
		}

		const warning = {
			message: 'Tudo tranquilo, sem alertas nos distritos seguidos =)',
			image: wink,
		};
		return this.renderWarningScreen(warning);
	}

	renderAllNotifications() {
		return (
			<ScrollView style={style.containerNotifications}>
				{this.state.notifications.map(item => this.renderNotification(item))}
			</ScrollView>
		);
	}

	renderWarningScreen(warning) {
		return (
			<View style={style.container}>
				<Image source={warning.image} style={style.wink} />
				<Text style={style.warning}>{warning.message}</Text>
				<Image source={background} style={style.background} />
			</View>
		);
	}

	renderImage(level) {
		switch (level) {
		case 'emergency':
			return <Image source={emergency} style={style.cardIconImage} />;
		case 'attention':
			return <Image source={attention} style={style.cardIconImage} />;
		case 'overflow':
			return <Image source={overflow} style={style.cardIconImage} />;
		case 'alert':
			return <Image source={alert} style={style.cardIconImage} />;
		default:
			return <Image source={attention} style={style.cardIconImage} />;
		}
	}

	renderNotification(item) {
		const color = this.state.colors[item.level] ? this.state.colors[item.level] : '#f1a225';
		return (
			<View key={`notification-${item.id}`} style={style.notification}>
				<Text style={style.date}>{this.formatDate(item.created_at)}</Text>
				<View style={style.card}>
					<View style={[style.cardIcon, { backgroundColor: color }]}>
						{this.renderImage(item.level)}
					</View>
					<View style={style.cardText}>
						<Text style={style.cardDescription}>{item.description}</Text>
					</View>
				</View>
			</View>
		);
	}

	render() {
		if (this.state.isLoaded) {
			return (
				<View style={style.container}>
					<Header pageTitle="Alertas" toggleMenu={this.toggleMenu} />
					<View style={style.menu}>
						<View style={[style.menuItem, this.state.activeMenu ? style.activeMenu : '']}>
							<Text onPress={() => this.changeAlerts('user')} style={style.menuText}>
								Meus Alertas
							</Text>
						</View>
						<View style={[style.menuItem, this.state.activeMenu ? '' : style.activeMenu]}>
							<Text onPress={() => this.changeAlerts('city')} style={style.menuText}>
								Alertas da cidade
							</Text>
						</View>
					</View>
					{this.preRenderNotifications()}
					<Drawer
						userName="Fulana"
						menuState={this.state.menu}
						toggleMenu={this.toggleMenu}
						changeRoute={this.changeRoute}
					/>
				</View>
			);
		}
		return (
			<View style={style.container}>
				<Header pageTitle="Meus Distritos" toggleMenu={this.toggleMenu} />
				<View style={style.container}>
					<Text>Carregando</Text>
				</View>
				<Drawer
					userName="Fulana"
					menuState={this.state.menu}
					toggleMenu={this.toggleMenu}
					changeRoute={this.changeRoute}
				/>
			</View>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);