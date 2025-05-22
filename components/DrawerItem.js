import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Block, Text, theme } from "galio-framework";

import Icon from "./Icon";
import argonTheme from "../constants/Theme";
import { makeLogout } from "../screens/API/actions/logout";

class DrawerItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggingOut: false,
    };
  }

  renderIcon = () => {
    const { title, focused } = this.props;

    switch (title) {
      case "Home":
        return (
          <Icon
            name="home"
            family="AntDesign"
            size={20}
            color={focused ? "white" : argonTheme.COLORS.PRIMARY}
          />
        );
      case "Elements":
        return (
          <Icon
            name="map-big"
            family="ArgonExtra"
            size={14}
            color={focused ? "white" : argonTheme.COLORS.ERROR}
          />
        );
      case "Articles":
        return (
          <Icon
            name="spaceship"
            family="ArgonExtra"
            size={14}
            color={focused ? "white" : argonTheme.COLORS.PRIMARY}
          />
        );
      case "Profile":
        return (
          <Icon
            name="user"
            family="AntDesign"
            size={14}
            color={focused ? "white" : argonTheme.COLORS.WARNING}
          />
        );
      case "Account":
        return (
          <Icon
            name="calendar-date"
            family="ArgonExtra"
            size={14}
            color={focused ? "white" : argonTheme.COLORS.INFO}
          />
        );
      case "Getting Started":
        return (
          <Icon
            name="spaceship"
            family="ArgonExtra"
            size={14}
            color={focused ? "white" : "rgba(0,0,0,0.5)"}
          />
        );
      case "Logout":
        return (
          <Icon
            name={"logout"}
            family="MaterialIcons"
            size={14}
            color={focused ? "white" : "rgba(0,0,0,0.5)"}
          />
        );
      default:
        return null;
    }
  };

  handleLogout = async () => {
    const { navigation } = this.props;
    this.setState({ isLoggingOut: true });

    try {
      const res = await makeLogout();
      console.log(res);
      navigation.navigate("Login");
    } catch (error) {
      console.log(error);
      alert("Could not logout, try again later!");
    } finally {
      this.setState({ isLoggingOut: false });
    }
  };

  render() {
    const { focused, title, navigation } = this.props;
    const { isLoggingOut } = this.state;

    const containerStyles = [
      styles.defaultStyle,
      focused ? [styles.activeStyle, styles.shadow] : null,
    ];

    return (
      <TouchableOpacity
        style={{ height: 60 }}
        onPress={() =>
          title === "Logout" ? this.handleLogout() : navigation.navigate(title)
        }
      >
        <Block flex row style={containerStyles}>
          <Block middle flex={0.1} style={{ marginRight: 5 }}>
            {this.renderIcon()}
          </Block>
          <Block row center flex={0.9}>
            {title === "Logout" && isLoggingOut ? (
              <ActivityIndicator
                size="small"
                color={focused ? "white" : "gray"}
              />
            ) : (
              <Text
                size={15}
                bold={focused}
                color={focused ? "white" : "rgba(0,0,0,0.5)"}
              >
                {title}
              </Text>
            )}
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  activeStyle: {
    backgroundColor: argonTheme.COLORS.ACTIVE,
    borderRadius: 4,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
  },
});

export default DrawerItem;
