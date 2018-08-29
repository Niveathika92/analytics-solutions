/*
 *  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React from 'react';
import Widget from '@wso2-dashboards/widget';
import VizG from 'react-vizgrammar';
import { Scrollbars } from 'react-custom-scrollbars';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import _ from 'lodash';
import Typography from '@material-ui/core/Typography';

const colorGreen = '#6ED460';
const colorRed = '#EC5D40';
const boolColorScale = [colorRed, colorGreen];

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
    },
});

const metadataOverall = {
    names: [
        'contextId',
        'username',
        'serviceProvider',
        'authenticationStep',
        'rolesCommaSeparated',
        'tenantDomain',
        'remoteIp',
        'region',
        'authSuccess',
        'utcTime',
    ],
    types: [
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
    ],
};

const metadataLocal = {
    names: ['contextId',
        'username',
        'serviceProvider',
        'userStoreDomain',
        'tenantDomain',
        'rolesCommaSeparated',
        'remoteIp',
        'region',
        'authSuccess',
        'utcTime',
    ],
    types: [
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
    ],
};

const metadataFederated = {
    names: [
        'contextId',
        'username',
        'serviceProvider',
        'identityProvider',
        'remoteIp',
        'region',
        'authSuccess',
        'utcTime',
    ],
    types: [
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
        'ordinal',
    ],
};

const columnsOverall = [
    {
        name: 'contextId',
        title: 'Context ID',
    },
    {
        name: 'username',
        title: 'User Name',
    },
    {
        name: 'serviceProvider',
        title: 'Service Provider',
    },
    {
        name: 'authenticationStep',
        title: 'Subject Step',
    },
    {
        name: 'rolesCommaSeparated',
        title: 'Roles',
    },
    {
        name: 'tenantDomain',
        title: 'Tenant Domain',
    },
    {
        name: 'remoteIp',
        title: 'IP',
    },
    {
        name: 'region',
        title: 'Region',
    },
    {
        name: 'authSuccess',
        title: 'Overall Authentication',
        colorBasedStyle: true,
        colorScale: boolColorScale,
    },
    {
        name: 'utcTime',
        title: 'Timestamp',
    },
];

const columnsLocal = [
    {
        name: 'contextId',
        title: 'Context ID',
    },
    {
        name: 'username',
        title: 'User Name',
    },
    {
        name: 'serviceProvider',
        title: 'Service Provider',
    },
    {
        name: 'userStoreDomain',
        title: 'User Store',
    },
    {
        name: 'tenantDomain',
        title: 'Tenant Domain',
    },
    {
        name: 'rolesCommaSeparated',
        title: 'Roles',
    },
    {
        name: 'remoteIp',
        title: 'IP',
    },
    {
        name: 'region',
        title: 'Region',
    },
    {
        name: 'authSuccess',
        title: 'Local Authentication',
        colorBasedStyle: true,
        colorScale: [colorGreen, colorRed],
    },
    {
        name: 'utcTime',
        title: 'Timestamp',
    },
];

const columnsFederated = [
    {
        name: 'contextId',
        title: 'Context ID',
    },
    {
        name: 'username',
        title: 'User Name',
    },
    {
        name: 'serviceProvider',
        title: 'Service Provider',
    },
    {
        name: 'identityProvider',
        title: 'identityProvider',
    },
    {
        name: 'remoteIp',
        title: 'IP',
    },
    {
        name: 'region',
        title: 'Region',
    },
    {
        name: 'authSuccess',
        title: 'Authentication Step Success',
        colorBasedStyle: true,
        colorScale: boolColorScale,
    },
    {
        name: 'utcTime',
        title: 'Timestamp',
    },
];

const tableConfig = {
    charts: [
        {
            type: 'table',
        },
    ],
    pagination: true,
    filterable: true,
    append: false,
};

class IsAnalyticsMessages extends Widget {
    constructor(props) {
        super(props);

        this.state = {
            tableConfig,
            data: [],
            isProviderConfigsFaulty: false,
            options: this.props.configs.options,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        };

        this.handleReceivedData = this.handleReceivedData.bind(this);
        this.onReceivingMessage = this.onReceivingMessage.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);

        this.props.glContainer.on('resize', () => this.setState({
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        }));
    }

    componentDidMount() {
        super.subscribe(this.onReceivingMessage);
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                this.setState({
                    dataProviderConf: message.data.configs.providerConfig,
                });
            })
            .catch(() => {
                this.setState({
                    isProviderConfigsFaulty: true,
                });
            });

        const tableConfigClone = _.cloneDeep(tableConfig);
        let metadata = [];
        switch (this.state.options.widgetType) {
            case ('Local'):
                tableConfigClone.charts[0].columns = columnsLocal;
                metadata = metadataLocal;
                break;
            case ('Federated'):
                tableConfigClone.charts[0].columns = columnsFederated;
                metadata = metadataFederated;
                break;
            default:
                tableConfigClone.charts[0].columns = columnsOverall;
                metadata = metadataOverall;
                break;
        }
        this.setState({
            tableConfig: tableConfigClone,
            metadata,
        });
    }

    handleReceivedData(message) {
        this.setState({
            data: message.data,
        });
        window.dispatchEvent(new Event('resize'));
    }

    onReceivingMessage(message) {
        if (message.header === 'additionalFilterConditions') {
            if (message.body === '') {
                this.setState({
                    additionalFilterConditions: undefined,
                    data: [],
                }, this.assembleQuery);
            } else {
                this.setState({
                    additionalFilterConditions: message.body,
                    data: [],
                }, this.assembleQuery);
            }
        } else {
            this.setState({
                fromDate: message.from,
                toDate: message.to,
                data: [],
            }, this.assembleQuery);
        }
    }

    assembleQuery() {
        super.getWidgetChannelManager()
            .unsubscribeWidget(this.props.id);
        const dataProviderConfigs = _.cloneDeep(this.state.dataProviderConf);
        let updatedQuery = dataProviderConfigs.configs.config.queryData.query;
        let filterCondition = ' on timestamp > {{from}}L and timestamp < {{to}}L ';
        let additionalFilters = '';
        let doAdditionalFilter = false;

        filterCondition = filterCondition
            .replace('{{per}}', this.state.per)
            .replace('{{from}}', this.state.fromDate)
            .replace('{{to}}', this.state.toDate);

        if (this.state.options.widgetType === 'Local') {
            updatedQuery = dataProviderConfigs.configs.config.queryData.queryLocal;
        } else if (this.state.options.widgetType === 'Federated') {
            updatedQuery = dataProviderConfigs.configs.config.queryData.queryFederated;
        }

        if (this.state.additionalFilterConditions !== undefined) {
            const additionalFilterConditionsClone = _.cloneDeep(this.state.additionalFilterConditions);

            for (const key in additionalFilterConditionsClone) {
                if (additionalFilterConditionsClone[key] !== '') {
                    if (key === 'role') {
                        additionalFilters = additionalFilters
                            + ' and str:contains(\'' + additionalFilterConditionsClone[key] + '\', rolesCommaSeparated) ';
                    } else if (key === 'isFirstLogin') {
                        additionalFilters = additionalFilters
                            + ' and ' + key + '==' + additionalFilterConditionsClone[key] + ' ';
                    } else {
                        additionalFilters = additionalFilters
                            + ' and ' + key + '==\'' + additionalFilterConditionsClone[key] + '\' ';
                    }
                }
            }
            doAdditionalFilter = true;
        }

        if (doAdditionalFilter) {
            filterCondition += additionalFilters;
        }

        updatedQuery = updatedQuery.replace('{{filterCondition}}', filterCondition);
        dataProviderConfigs.configs.config.queryData.query = updatedQuery;

        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleReceivedData, dataProviderConfigs);
    }

    render() {
        const { width } = this.state;
        const { height } = this.state;
        let theme = darkTheme;

        if (this.props.muiTheme.name === 'light') {
            theme = lightTheme;
        }
        if (this.state.isProviderConfigsFaulty) {
            return (
                <MuiThemeProvider theme={theme}>
                    <Scrollbars style={{
                        height,
                        width,
                    }}>
                        <div
                            style={{
                                paddingLeft: width * 0.05,
                                paddingRight: width * 0.05,
                                paddingTop: height * 0.05,
                                paddingBottom: height * 0.05,
                                height,
                                width,
                            }}
                        >
                            <div>
                                <Typography variant="title" gutterBottom align="center">
                                    Messages
                                </Typography>
                                <Typography variant="title" gutterBottom align="center">
                                    [ERROR]: Cannot connect with the data provider
                                </Typography>
                            </div>
                        </div>
                    </Scrollbars>
                </MuiThemeProvider>
            );
        }
        return (
            <MuiThemeProvider theme={theme}>
                <Scrollbars style={{
                    height,
                    width,
                }}>
                    <div
                        style={{
                            paddingLeft: width * 0.05,
                            paddingRight: width * 0.05,
                            paddingTop: height * 0.05,
                            paddingBottom: height * 0.05,
                            height,
                            width,
                        }}
                    >
                        <div
                            style={{
                                height: height * 0.1,
                                width: width * 0.9,
                            }}
                        >
                            <Typography variant="title" gutterBottom align="center">
                                Messages
                            </Typography>
                        </div>
                        <div style={{ height: height * 0.8, width: width * 0.9 }}>
                            <VizG
                                config={this.state.tableConfig}
                                metadata={this.state.metadata}
                                data={this.state.data}
                                append={false}
                                theme={this.props.muiTheme.name}
                            />
                        </div>
                    </div>
                </Scrollbars>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget('IsAnalyticsMessages', IsAnalyticsMessages);
