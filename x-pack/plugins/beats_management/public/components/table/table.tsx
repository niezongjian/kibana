/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  // @ts-ignore
  EuiInMemoryTable,
  EuiSpacer,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React from 'react';
import styled from 'styled-components';
import { AutocompleteSuggestion } from 'ui/autocomplete_providers';
import { TABLE_CONFIG } from '../../../common/constants';
import { AutocompleteField } from '../autocomplete_field/index';
import { ControlSchema } from './action_schema';
import { OptionControl } from './controls/option_control';
import { TableType } from './table_type_configs';

export enum AssignmentActionType {
  Add,
  Assign,
  Delete,
  Edit,
  Reload,
  Search,
}

export interface KueryBarProps {
  filterQueryDraft: string;
  isLoadingSuggestions: boolean;
  isValid: boolean;
  loadSuggestions: (value: string, cursorPosition: number, maxCount?: number) => void;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  suggestions: AutocompleteSuggestion[];
  value: string;
}

interface TableProps {
  actions?: ControlSchema[];
  actionData?: {
    [key: string]: any;
  };
  hideTableControls?: boolean;
  kueryBarProps?: KueryBarProps;
  items: any[];
  type: TableType;
  actionHandler?(action: AssignmentActionType, payload?: any): void;
}

interface TableState {
  selection: any[];
}

const TableContainer = styled.div`
  padding: 16px;
`;

export class Table extends React.Component<TableProps, TableState> {
  constructor(props: any) {
    super(props);

    this.state = {
      selection: [],
    };
  }

  public resetSelection = () => {
    this.setSelection([]);
  };

  public setSelection = (selection: any[]) => {
    this.setState({
      selection,
    });
  };

  public actionHandler = (action: AssignmentActionType, payload?: any): void => {
    if (this.props.actionHandler) {
      this.props.actionHandler(action, payload);
    }
  };

  public render() {
    const { actionData, actions, hideTableControls, items, kueryBarProps, type } = this.props;

    const pagination = {
      initialPageSize: TABLE_CONFIG.INITIAL_ROW_SIZE,
      pageSizeOptions: TABLE_CONFIG.PAGE_SIZE_OPTIONS,
    };

    const selectionOptions = hideTableControls
      ? null
      : {
          onSelectionChange: this.setSelection,
          selectable: () => true,
          selectableMessage: () =>
            i18n.translate('xpack.beatsManagement.table.selectThisBeatTooltip', {
              defaultMessage: 'Select this beat',
            }),
          selection: this.state.selection,
        };

    return (
      <TableContainer>
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
          {actions &&
            actions.map(action => (
              <EuiFlexItem grow={false} key={action.name}>
                <OptionControl
                  {...action}
                  actionData={actionData}
                  actionHandler={this.actionHandler}
                  disabled={this.state.selection.length === 0}
                />
              </EuiFlexItem>
            ))}

          {kueryBarProps && (
            <EuiFlexItem>
              <AutocompleteField
                {...kueryBarProps}
                placeholder={i18n.translate(
                  'xpack.beatsManagement.table.filterResultsPlaceholder',
                  {
                    defaultMessage: 'Filter results',
                  }
                )}
              />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiInMemoryTable
          columns={type.columnDefinitions}
          items={items}
          itemId="id"
          isSelectable={true}
          pagination={pagination}
          selection={selectionOptions}
          sorting={true}
        />
      </TableContainer>
    );
  }
}