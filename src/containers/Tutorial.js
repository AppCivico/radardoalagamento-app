/* eslint-disable react/prop-types, react/sort-comp, class-methods-use-this */
import React from 'react';
import {
	View,
	ScrollView,
	ViewPagerAndroid,
	Platform,
	Image,
	Text,
	TouchableOpacity,
	TouchableNativeFeedback,
} from 'react-native';

import tutorial from '../styles/containers/tutorial';

import imgTutorial1 from '../assets/images/img_tutorial_1.png';
import imgTutorial2 from '../assets/images/img_tutorial_2.png';
import imgTutorial3 from '../assets/images/img_tutorial_3.png';
import bgTutorial2 from '../assets/images/bg_tutorial_2.png';
import bgTutorial3 from '../assets/images/bg_tutorial_3.png';
import next from '../assets/images/next.png';

class Tutorial extends React.Component {
	static navigationOptions = {
		tabBarVisible: false,
	};

	constructor(props) {
		super(props);
		this.state = {
			width: 0,
			height: 0,
			selectedIndex: 0,
			initialSelectedIndex: 0,
			scrollingTo: null,
			count: 3,
			children: [
				{
					id: 1,
					image: imgTutorial1,
					title: 'Tempo real!',
					text:
						'Avance para ver os 2 passos simples para receber alertas do seu distrito ou zona de São Paulo. ',
				},
				{
					id: 2,
					image: imgTutorial2,
					title: 'Seus distritos',
					text: 'Escolha um ou mais distritos (bairros) ou toda zona para seguir.',
					background: bgTutorial2,
				},
				{
					id: 3,
					image: imgTutorial3,
					title: 'Alertas',
					text: 'Faça o breve cadastro e acompanhe alertas sobre seu(s) distrito(s).',
					background: bgTutorial3,
				},
			],
		};
		this.handleHorizontalScroll = this.handleHorizontalScroll.bind(this);
		this.adjustCardSize = this.adjustCardSize.bind(this);
		this.nextTutorial = this.nextTutorial.bind(this);
		this.skipTutorial = this.skipTutorial.bind(this);
		this.renderContent = this.renderContent.bind(this);
	}

	render() {
		if (Platform.OS === 'ios') {
			return this.renderIOS();
		}
		return this.renderAndroid();
	}

	renderButtons() {
		return (
			<View style={tutorial.footer}>
				<View style={tutorial.button}>
					<TouchableOpacity onPress={this.skipTutorial}>
						<Text style={tutorial.skip}>PULAR</Text>
					</TouchableOpacity>
				</View>
				<View style={tutorial.bullets}>
					{this.state.children.map((child, i) => this.renderBullets(child, i))}
				</View>
				<View style={tutorial.button}>
					{/*
						<TouchableNativeFeedback onPress={e => this.handleHorizontalScroll(e)}>
							<Image source={next} style={tutorial.hamburguer} />
						</TouchableNativeFeedback>
					*/}
				</View>
			</View>
		);
	}

	renderIOS() {
		return (
			<View style={tutorial.container}>
				<ScrollView
					ref="scrollview" // eslint-disable-line react/no-string-refs
					contentOffset={{
						x: this.state.width * this.state.initialSelectedIndex,
						y: 0,
					}}
					style={tutorial.container}
					horizontal
					pagingEnabled
					scrollsToTop={false}
					onScroll={this.handleHorizontalScroll}
					scrollEventThrottle={100}
					removeClippedSubviews
					automaticallyAdjustContentInsets={false}
					directionalLockEnabled
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					onLayout={this.adjustCardSize}
				>
					{this.state.children.map((child, i) => this.renderContent(child, i))}
				</ScrollView>
				{this.renderButtons()}
			</View>
		);
	}

	renderAndroid() {
		return (
			<View style={tutorial.container}>
				<ViewPagerAndroid
					ref="scrollview" // eslint-disable-line react/no-string-refs
					initialPage={this.state.initialSelectedIndex}
					onPageSelected={this.handleHorizontalScroll}
					style={tutorial.container}
				>
					{this.state.children.map((child, i) => this.renderContent(child, i))}
				</ViewPagerAndroid>
				{this.renderButtons()}
			</View>
		);
	}

	adjustCardSize(e) {
		this.setState({
			width: e.nativeEvent.layout.width,
			height: e.nativeEvent.layout.height,
		});
	}

	skipTutorial() {
		this.props.navigation.navigate('Tab');
	}

	nextTutorial() {
		let { selectedIndex } = this.state;
		if (selectedIndex < 0 || selectedIndex === this.state.count - 1) {
			this.props.navigation.navigate('Tab');
			return;
		}

		selectedIndex += 1;
		this.setState({ selectedIndex, scrollingTo: null });
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.selectedIndex !== this.state.selectedIndex) {
			if (Platform.OS === 'ios') {
				// eslint-disable-next-line react/no-string-refs
				this.refs.scrollview.scrollTo({
					x: nextProps.selectedIndex * this.state.width,
					animated: true,
				});
				this.setState({ scrollingTo: nextProps.selectedIndex });
			} else {
				// eslint-disable-next-line react/no-string-refs
				this.refs.scrollview.setPage(nextProps.selectedIndex);
				this.setState({ selectedIndex: nextProps.selectedIndex });
			}
		}
	}

	renderContent(child, i) {
		const { width, height } = this.state;
		const style = tutorial.view;
		return (
			<View style={[style, { width, height }]} key={`r_${i}`}>
				<Image source={child.image} style={tutorial.image} />
				<View style={tutorial.text}>
					<View style={{ marginBottom: 10 }}>
						<Text style={tutorial.textTitle}>{child.title}</Text>
					</View>
					<Text style={tutorial.textContent}>{child.text}</Text>
				</View>
				<Image source={child.background} style={tutorial.background} />
			</View>
		);
	}

	renderBullets(child, i) {
		return (
			<View
				key={`bullet-${child.id}`}
				style={[
					i === this.state.selectedIndex ? tutorial.selected : tutorial.notSelected,
					tutorial.bullet,
				]}
			/>
		);
	}

	handleHorizontalScroll(e) {
		let selectedIndex = e.nativeEvent.position;

		if (selectedIndex === undefined) {
			selectedIndex = this.state.selectedIndex + 1;
		}

		if (selectedIndex < 0 || selectedIndex >= this.state.count) {
			this.skipTutorial();
			return;
		}
		if (this.state.scrollingTo !== null && this.state.scrollingTo !== selectedIndex) {
			return;
		}
		if (this.props.selectedIndex !== selectedIndex || this.state.scrollingTo !== null) {
			this.setState({ selectedIndex, scrollingTo: null });
			const { onSelectedIndexChange } = this.props;
			// eslint-disable-next-line no-unused-expressions
			onSelectedIndexChange && onSelectedIndexChange(selectedIndex);
		}
	}
}

export default Tutorial;
