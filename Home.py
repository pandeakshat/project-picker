import streamlit as st
import pandas as pd
import gspread
import numpy as np
from oauth2client.service_account import ServiceAccountCredentials
import time
from datetime import datetime
import json



g_credentials = st.secrets["google_auth"]
cred = dict(g_credentials) 
# Google Sheets Authentication
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
credentials = ServiceAccountCredentials.from_json_keyfile_dict( cred, scope)
gc = gspread.authorize(credentials)

# Load Google Sheet data
sheet_url = "https://docs.google.com/spreadsheets/d/1dYpcBXXDB2VasRwfKAuXv_wxvtDE7VIaw9FIZcoFqiY/edit#gid=0" 
worksheet = gc.open_by_url(sheet_url).sheet1
data = worksheet.get_all_records()
header_row = worksheet.row_values(1) 
df = pd.DataFrame(data)
update = header_row.index("Last Updated") + 1
pomodoro = header_row.index("Pomodoros") + 1
now = datetime.now()


# Project Selection Logic (with weights and biases)
def calculate_score(row):
    # Modify weights as desired
    score =  (row['Pomodoros'] * -0.3) + \
             (row['Complexity'] * 0.2) + \
             (row['Priority'] * 0.4) 
    return score

df['score'] = df.apply(calculate_score, axis=1)

def select_project(df):
    df['probability'] = df['score'] / df['score'].sum()  # Normalize scores into probabilities
    selected_project = np.random.choice(df['Project'], p=df['probability'])
    return selected_project

# Display Selected Project
st.markdown("<h1 style='text-align: center; color: white;'>Project Picker</h1>", unsafe_allow_html=True)
selected_project=select_project(df)  


st.markdown(
    """
<style>
button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 20;
    border: 3px solid green; 
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}
</style>
""",
    unsafe_allow_html=True,
)



if st.button("Select Project"):
    st.header("Project Selected: " + selected_project)
    with st.expander( selected_project + " Details", expanded=True):
            selected_columns = ['Project', 'Complexity', 'Priority', 'Pomodoros', 'Last Updated']  # Columns you want to display
            st.write(df[df['Project'] == selected_project][selected_columns])
            st.write(df[df['Project'] == selected_project]['Information'].values[0])
            st.link_button("Go to Project", "https://google.com")
            search_column = 1  # Column to check for the value
            search_value = selected_project  # Value to find in the row
            cell = worksheet.find(search_value, in_column=search_column)  
            row_number = cell.row
            last_update_column = update  # Column to update
            last_update = str(now.strftime("%Y/%m/%d %I:%M %p"))
            worksheet.update_cell(row_number, last_update_column, last_update)
            ph = st.empty()
            N = 25*60
            for secs in range(N,0,-1):
                mm, ss = secs//60, secs%60
                ph.metric("Countdown", f"{mm:02d}:{ss:02d}")
                time.sleep(1)
            pomodoro_column = pomodoro  # Column to update
            pomodoro_value = int(df[df['Project'] == selected_project]['Pomodoros'].values[0] + 1)
            worksheet.update_cell(row_number, pomodoro_column, pomodoro_value)
            st.write("Success!")
