import {
    BadgeSize,
    BadgeVariant,
  } from '../primitives/badge/badge.types';
  import {
    ButtonSize,
    ButtonVariant,
  } from '../primitives/button/button.types';
  import {
    SemanticTokenName,
    ThemeMode,
    TokenName,
  } from '../tokens/tokens';
  
  export type WorkbenchComponentId = 'button' | 'combobox' | 'dialog' | 'badge';
  
  export type WorkbenchRegionName =
    | 'workbench/shell'
    | 'workbench/nav'
    | 'workbench/stage'
    | 'workbench/props'
    | 'workbench/tokens'
    | 'workbench/a11y';
  
  export interface WorkbenchButtonPropState {
    variant: ButtonVariant;
    size: ButtonSize;
    disabled: boolean;
    asChild: boolean;
  }
  
  export interface WorkbenchComboboxPropState {
    disabled: boolean;
    invalid: boolean;
    open: boolean;
    value: string;
  }
  
  export interface WorkbenchDialogPropState {
    open: boolean;
    asChild: boolean;
  }
  
  export interface WorkbenchBadgePropState {
    variant: BadgeVariant;
    size: BadgeSize;
    asChild: boolean;
  }
  
  export interface WorkbenchPropStateMap {
    button: WorkbenchButtonPropState;
    combobox: WorkbenchComboboxPropState;
    dialog: WorkbenchDialogPropState;
    badge: WorkbenchBadgePropState;
  }
  
  export interface WorkbenchKeyboardEntry {
    key: string;
    behavior: string;
  }
  
  export interface WorkbenchTokenEntry {
    name: TokenName;
    aliasOf?: SemanticTokenName | string;
    value: string;
  }
  
  export interface WorkbenchShellProps {
    defaultComponent?: WorkbenchComponentId;
    defaultTheme?: ThemeMode;
  }