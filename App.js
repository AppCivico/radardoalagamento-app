import React from 'react';
import { StackNavigator } from 'react-navigation';
import { AppLoading, Font } from 'expo';

import Roboto from './src/assets/fonts/Raleway-Regular.ttf';
import RobotoMedium from './src/assets/fonts/Raleway-Medium.ttf';
import RobotoBold from './src/assets/fonts/Raleway-Bold.ttf';

import Welcome from './src/containers/Welcome';
import Tutorial from './src/containers/Tutorial';

const FirstLaunchNavigation = StackNavigator(
	{
		Welcome: { screen: Welcome },
		Tutorial: { screen: Tutorial },
	},
	{
		initialRouteName: 'Tutorial',
		headerMode: 'none',
	},
);

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
		};
	}

	componentWillMount() {
		this.loadAssetsAsync();
	}

	loadAssetsAsync = async () => {
		await Font.loadAsync({
			roboto: Roboto,
			robotoMedium: RobotoMedium,
			robotoBold: RobotoBold,
		});
		this.setState({ loaded: true });
	};

	render() {
		if (!this.state.loaded) {
			return <AppLoading />;
		}

		return <FirstLaunchNavigation />;
	}
}

export default App;
