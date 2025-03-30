# Get the current directory
$directory = Get-Location

# Get all files in the current directory that contain "Dark" in their names
$files = Get-ChildItem -Path $directory -Filter "*Dark*"

# Iterate over each file
foreach ($file in $files) {
    # Construct the new file name by removing "Dark"
    $newName = $file.Name -replace "Dark", ""

    # Construct the full path for the new file name
    $newPath = Join-Path -Path $directory -ChildPath $newName

    # Rename the file
    Rename-Item -Path $file.FullName -NewName $newPath
}

Write-Output "Files have been renamed successfully."
