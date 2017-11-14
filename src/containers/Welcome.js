import React from 'react';
import { View, Image } from 'react-native';

import welcome from '../styles/containers/welcome';

import logo from '../assets/images/logo_radar.png';
import background from '../assets/images/elements_bg.png';

const Welcome = () => (
	<View style={welcome.container}>
		<Image
			source={logo}
			style={welcome.logo}
			resizeMode="contain"
		/>
		<Image
			source={background}
			style={welcome.background}
			resizeMode="contain"
		/>
	</View>
);

export default Welcome;