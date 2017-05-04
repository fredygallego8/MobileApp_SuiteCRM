import React, { Component } from 'react';
import { Text, ScrollView, View, Button, FlatList, ListItem, TouchableHighlight, ActivityIndicator, Image } from 'react-native';

import { styles as defaultStyles } from '../../layout/styles.js'
import { styles, images } from './index.js'
import * as constants from '../../config/const.js'
import { restCall } from '../../lib/rest_api.js'


var DEBUG = false;

export class ProspectListScreen extends Component {

  constructor(props) {
    super(props);
    this.state= {session: undefined, error: false, isFetching: false, prospectList: []};
    this.navigate = this.navigate.bind(this);
    
  }

  /*item is used to know if the delete button should be present on the entry.*/
  navigate(route, item=null){
    	this.props.navigator.push({
    		  id: route,
          passProp: {
              item: item,
              ip: this.props.ip,
              sessionID: this.props.session,
          },
    	}); 
  }

  setNavActions(){
    var navigator = this.props.navigator;
   
    navigator.__renderLeftNavButton = this.renderLeftNavButton.bind(this);
    navigator.__renderRightNavButton = this.renderRightNavButton.bind(this);
   
    navigator.__onLeftNavButtonPressed = this.logout.bind(this);
    navigator.__onRightNavButtonPressed = this.reload.bind(this);
  }

  renderLeftNavButton(){
      return (      
          <Image source={images.logoutIcon} style={styles.icon} />
      );
  }

  renderRightNavButton(){
      return (
          <Image source={images.reloadIcon} style={styles.icon} />
      );
  }

  logout(){
    this.props.navigator.pop();
  }

  goToEdit(item){
    this.navigate(constants.editScreen, item);
  }

  reload(){
    this.fetchProspectList();
  }

  componentDidMount(){
    this.fetchProspectList();
  }

  fetchProspectList(){

    if(DEBUG){
      console.log("(ListScreen) Session id received = " + this.props.session);
    }

    var param = '{"session":"'+ this.props.session +'","module_name":"Leads","query":"","max_results":"100" }';

    this.setState({isFetching: true});

    var onSuccess = function(responseData){
        this.setState({isFetching: false, error: false, prospectList: responseData.entry_list});
    }
    var onFailure = function(error){
        this.setState({isFetching: false, error: true});
    }

    restCall("get_entry_list", param, this.props.ip, onSuccess.bind(this), onFailure.bind(this));
  }


  render() {
  this.setNavActions();
    	return (
    		<View style={styles.container}>
    
    				{/*Header Part*/}
    				<View style={styles.headerWrapper}>
              {this.state.error && 
                  <Text style={defaultStyles.fontBasicError}>Erreur de réseau</Text> ||
    					         <Text style={defaultStyles.fontBasicNote}>Selectionnez un prospect pour le modifier</Text>
              }
    				</View>

    				{/*Body Part*/}
    				<View style={styles.bodyWrapper}>

                { this.state.isFetching &&
                   <ActivityIndicator style={styles.activityIndicator} size="large" /> ||

                    <ScrollView style={styles.scroll}>
                        <FlatList 
                            data={this.state.prospectList}
                            keyExtractor = {(item, index) => item.name_value_list.id.value}
                            renderItem={({item}) =>
                            <TouchableHighlight onPress={() => this.goToEdit(item)}>
                                <Text style={defaultStyles.fontBasicBig}>{item.name_value_list.name.value}</Text>
                            </TouchableHighlight>
                            }
                        />
          			    </ScrollView>
    				    }
            </View>

	    			{/*Button Part*/}
    				<View style={styles.buttonWrapper}>
    				    <Button
              			onPress={() => this.navigate(constants.editScreen)}
             				title="Créer un nouveau prospect"
              			color="#1F94B7"
              			accessibilityLabel="Créer un nouveau prospect"
            	  />
    				</View>

    		</View>
  		);
  }
}