import streamlit as st
import pandas as pd
import gspread
import numpy as np
from oauth2client.service_account import ServiceAccountCredentials

def main():

    # Google Sheets Authentication
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_name('project-picker-pandeakshat-5ff69a2ff187.json', scope)
    gc = gspread.authorize(credentials)

    # Load Google Sheet data
    sheet_url = "https://docs.google.com/spreadsheets/d/1dYpcBXXDB2VasRwfKAuXv_wxvtDE7VIaw9FIZcoFqiY/edit#gid=0" 
    worksheet = gc.open_by_url(sheet_url).sheet1
    data = worksheet.get_all_records()
    df = pd.DataFrame(data)

    unique_values = df['Project'].unique().tolist()
    unique_values.append("All")
    unique_values.reverse()
    choice = st.sidebar.radio("Select Project", unique_values)

    for item in unique_values:
        if choice == "All":
            st.header("All Projects")
            for index, row in df.iterrows():
                st.write("Project Name:", row['Project'])
                st.write("Information:", row['Information'])
                st.link_button("Go to Project", row["Link"])
                st.write("Status:", row['Status']) 
                st.write("-----")
        elif choice == item:
            st.header("Project -- " + choice)
            for index, row in df.iterrows():
                if row['Project'] == choice:
                    st.write("Information:", row['Information'])
                    st.link_button("Go to Project", row["Link"])
                    st.write("Status:", row['Status']) 
                    st.write("-----")
        

    # if choice == "All":
        # st.header("All Projects")
        # for index, row in df.iterrows():
        #     st.write("Project Name:", row['Project'])
        #     st.write("Information:", row['Information'])
        #     st.link_button("Go to Project", row["Link"])
        #     st.write("Status:", row['Status']) 
        #     st.write("-----")

    # elif choice == "Medium":
    #     st.header("Project -- Medium")
    #     for index, row in df.iterrows():
    #         if row['Project'] == "Medium":
    #             st.write("Information:", row['Information'])
    #             st.link_button("Go to Project", row["Link"])
    #             st.write("Status:", row['Status']) 
    #             st.write("-----")

    

    # for index, row in df.iterrows():
    #     st.write("Project Name:", row['Project'])
    #     st.write("Information:", row['Information'])
    #     st.link_button("Go to Project", row["Link"])
    #     st.write("Status:", row['Status']) 
    #     st.write("-----")

if __name__ == "__main__":
    main()