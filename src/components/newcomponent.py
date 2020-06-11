import sys
import os

if len(sys.argv) == 1:
    print('newcomponent.py requires at least 1 command line\n argument specifying the component name.')
    exit()
comp_name = sys.argv[1]
is_functional = False
if len(sys.argv) == 3:
    is_functional = (sys.argv[2] == 'func')

os.mkdir(f'./{comp_name}')
with open(f'./{comp_name}/{comp_name}.js', 'w') as react_file:
    body = f'''export default {comp_name} = props => {{
    return(
        <div>{comp_name}</div>
    );
}}''' if is_functional else f'''export default class {comp_name} extends React.Component {{
    constructor(props) {{
        super(props);
    }}

    render() {{
        return(
            <div></div>
        );
    }}
}}'''

    react_file.write(f'''import React from 'react';
import styles from './{comp_name}.module.css';

{body}''')


with open(f'./{comp_name}/{comp_name}.module.css', 'w') as css_module:
    css_module.write(f'''''')


with open('./index.js', 'a') as component_exports:
    component_exports.write(f'\nexport {{ default as {comp_name} }} from \'./{comp_name}/{comp_name}\';')