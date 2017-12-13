/* eslint-disable react/prop-types, class-methods-use-this, array-callback-return */
import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableWithoutFeedback,
	Button,
	StyleSheet,
	Alert,
	AsyncStorage,
	Dimensions,
	ScrollView,
	Keyboard,
} from 'react-native';

import { mapStateToProps, mapDispatchToProps } from '../store';

import registerForPushNotificationsAsync from '../registerForPushNotificationsAsync';

import Header from '../components/Header';
import Drawer from '../components/Drawer';

import { colors } from '../styles/variables';

import background from '../assets/images/elements_bg.png';
import iconProfile from '../assets/images/person.png';
import iconEmail from '../assets/images/email.png';
import iconPhone from '../assets/images/call.png';
import edit from '../assets/images/edit.png';

const style = StyleSheet.create({
	container: {
		flex: 1,
	},
	background: {
		flex: 1,
		resizeMode: 'contain',
		width: '100%',
		height: 'auto',
		alignSelf: 'flex-start',
	},
	text: {
		paddingTop: 15,
		paddingBottom: 15,
		paddingLeft: 30,
		paddingRight: 30,
	},
	textTitle: {
		fontFamily: 'raleway',
		fontSize: 22,
		marginBottom: 10,
		textAlign: 'center',
		color: '#5d5d5d',
	},
	form: {
		flexDirection: 'column',
		flex: 1,
		paddingLeft: 20,
		paddingRight: 20,
		marginBottom: 30,
	},
	formItem: {
		flex: 1,
		flexDirection: 'row',
	},
	formIcon: {
		flex: 1,
		alignItems: 'center',
	},
	formInput: {
		flex: 4,
	},
	icon: {
		width: 25,
		height: 25,
		resizeMode: 'contain',
		marginRight: 30,
	},
	input: {
		height: 40,
		paddingBottom: 15,
		paddingLeft: 3,
		fontSize: 18,
		fontFamily: 'raleway',
		color: colors.gray,
	},
	button: {
		fontFamily: 'raleway',
		flex: 1,
		width: 100,
	},
	nextPageButton: {
		position: 'absolute',
		top: 43,
		right: 20,
		width: 20,
		height: 20,
		resizeMode: 'contain',
	},
});

class Profile extends React.Component {
	constructor() {
		super();
		this.state = {
			menu: false,
			name: 'Nome',
			surname: 'Sobrenome',
			email: 'E-mail',
			phone: '(11) 9.9999-8888',
			newUser: true,
			registering: false,
			extra: false,
			user: {},
		};
		this.toggleMenu = this.toggleMenu.bind(this);
		this.changeRoute = this.changeRoute.bind(this);
		this.createUser = this.createUser.bind(this);
		this.registerUser = this.registerUser.bind(this);
		this.editProfile = this.editProfile.bind(this);
		this.keyboardShow = this.keyboardShow.bind(this);
		this.keyboardHide = this.keyboardHide.bind(this);
	}

	componentWillMount() {
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardHide);
	}

	componentDidMount() {
		// check if user exists
		try {
			AsyncStorage.getItem('user')
				.then((res) => {
					if (res != null) {
						const user = JSON.parse(res);
						const { name, email, phone_number } = user.user;
						const surname = name
							.split(' ')
							.slice(1)
							.join(' ');
						this.setState({
							name: name.split(' ')[0],
							surname,
							email,
							phone: phone_number.replace('+55', ''),
							newUser: false,
							user,
						});
					}
				})
				.catch(() => {});
		} catch (error) {
			// Error retrieving data
		}
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	keyboardShow() {
		const extra = true;
		this.setState({ extra });
		setTimeout(() => {
			this.scrollToEnd({ animated: false });
		}, 2);
	}

	keyboardHide() {
		const extra = false;
		this.setState({ extra });
	}

	toggleMenu() {
		const menu = !this.state.menu;
		this.setState({ menu });
	}

	changeRoute(route) {
		this.props.navigation.navigate(route);
	}

	validateEmail(email) {
		const re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

	showError(msg = 'Campo obrigatório') {
		Alert.alert('Atenção', msg, [{ text: 'OK' }], { cancelable: false });
	}

	createUser() {
		if (this.state.name === '') {
			this.showError();
			return false;
		}
		if (this.state.surname === '') {
			this.showError();
			return false;
		}
		if (this.state.email === '') {
			this.showError();
			return false;
		}
		if (this.state.phone === '') {
			this.showError();
			return false;
		}

		const validEmail = this.validateEmail(this.state.email);
		if (!validEmail) {
			this.showError('E-mail inválido');
			return false;
		}

		const { phone } = this.state;
		const cleanPhone = phone
			.trim()
			.replace(/\W+/g, '')
			.replace(/\D+/g, '');

		return {
			name: `${this.state.name.trim()} ${this.state.surname.trim()}`,
			email: this.state.email.trim(),
			password: '123segredo$$',
			password_confirmation: '123segredo$$',
			phone_number: `+55${cleanPhone}`,
		};
	}

	registerUser() {
		const { user } = this.props;
		registerForPushNotificationsAsync().then((res) => {
			user.token = { value: res };

			const newUser = this.createUser();

			if (newUser) {
				// disable button
				let registering = !this.state.registering;
				this.setState({ registering });

				user.user = newUser;
				axios({
					method: 'POST',
					url: 'https://dtupa.eokoe.com/signup',
					headers: { 'Content-Type': 'application/json' },
					data: this.props.user,
				}).then(
					(response) => {
						const apikey = response.data.api_key;
						this.props.apikey = apikey;
						AsyncStorage.setItem('apikey', apikey)
							.then(() => {
								AsyncStorage.setItem('user', JSON.stringify(this.props.user))
									.then(() => {
										this.changeRoute('Notifications');
									})
									.catch(() => {});
							})
							.catch(() => {});
					},
					() => {
						this.showError('Ops! Ocorreu um erro no seu cadastro, tente novamente!');

						registering = !this.state.registering;
						this.setState({ registering });
					},
				);
			}
		});
	}

	editProfile() {
		const newUser = this.createUser();
		const { user } = this.state;

		if (newUser) {
			user.user = newUser;
			axios({
				method: 'PUT',
				url: 'https://dtupa.eokoe.com/me',
				headers: { 'Content-Type': 'application/json' },
				data: user,
			}).then(
				() => {
					AsyncStorage.setItem('user', JSON.stringify(user))
						.then(() => {
							this.showError('Perfil atualizado!');
						})
						.catch(() => {});
				},
				() => {
					this.showError('Ops! Ocorreu um erro ao atualizar o seu cadastro, tente novamente!');
				},
			);
		}
	}

	scrollToEnd() {
		this.scrollView.scrollToEnd();
	}

	render() {
		return (
			<ScrollView
				style={style.container}
				ref={(scrollView) => { this.scrollView = scrollView; }}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View style={{ height: Dimensions.get('window').height }}>
					{!this.state.newUser && <Header pageTitle="Perfil" toggleMenu={this.toggleMenu} />}
					<View style={style.container}>
						<Image source={background} style={style.background} />
						{this.state.newUser && (
							<View style={style.text}>
								<Text style={style.textTitle}>Um breve cadastro para não perder seus alertas!</Text>
							</View>
						)}
						<View style={style.form}>
							<View style={style.formItem}>
								<View style={style.formIcon}>
									<Image source={iconProfile} style={style.icon} />
								</View>
								<View style={style.formInput}>
									<TextInput
										style={style.input}
										onChangeText={name => this.setState({ name })}
										placeholder={this.state.name}
										placeholderTextColor={colors.gray}
										keyboardType="default"
									/>
								</View>
							</View>
							<View style={style.formItem}>
								<View style={style.formIcon}>
									<Image source={iconProfile} style={style.icon} />
								</View>
								<View style={style.formInput}>
									<TextInput
										style={style.input}
										onChangeText={surname => this.setState({ surname })}
										placeholder={this.state.surname}
										placeholderTextColor={colors.gray}
										keyboardType="default"
									/>
								</View>
							</View>
							<View style={style.formItem}>
								<View style={style.formIcon}>
									<Image source={iconEmail} style={style.icon} />
								</View>
								<View style={style.formInput}>
									<TextInput
										style={style.input}
										onChangeText={email => this.setState({ email })}
										placeholder={this.state.email}
										placeholderTextColor={colors.gray}
										keyboardType="email-address"
									/>
								</View>
							</View>
							<View style={style.formItem}>
								<View style={style.formIcon}>
									<Image source={iconPhone} style={style.icon} />
								</View>
								<View style={style.formInput}>
									<TextInput
										style={style.input}
										onChangeText={phone => this.setState({ phone })}
										placeholder={this.state.phone}
										placeholderTextColor={colors.gray}
										keyboardType="phone-pad"
									/>
								</View>
							</View>
							{this.state.newUser && (
								<Button
									onPress={() => this.registerUser()}
									title="Enviar"
									color={colors.blueDark}
									accessibilityLabel="Enviar"
									disabled={this.state.registering}
								/>
							)}
						</View>
					</View>
					{!this.state.newUser && (
						<TouchableWithoutFeedback onPress={() => this.editProfile()}>
							<Image source={edit} style={style.nextPageButton} />
						</TouchableWithoutFeedback>
					)}
					{!this.state.newUser && (
						<Drawer
							menuState={this.state.menu}
							toggleMenu={this.toggleMenu}
							changeRoute={this.changeRoute}
						/>
					)}
				</View>
				{this.state.extra && <View style={{ height: 250 }} />}
			</ScrollView>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
