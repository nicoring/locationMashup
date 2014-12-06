#! /bin/bash

get_result_from_request() {
  request=$1
  # echo $request

  # split parts by empty lines
  result={}
  index=0
  while IFS="" read -ra line; do
    if [ "$line" = "" ]; then
      index=$(($index+1))
    else
      result[$index]="${result[$index]}$line"
    fi
  done <<< "$request"

  echo "${result[2]}"
  return 0
}

# via stdin
rdf_file=$1
output=$2
startWithIndex=$3
endWithIndex=$4


if [ "$startWithIndex" = "" ]; then
  startWithIndex=0
  if [ -f $output ]; then
    rm $output
  fi
fi

BASEURL="http://tour-pedia.org/resource"

entities=$(cat "$rdf_file" | grep -E "http:\/\/tour-pedia\.org\/resource\/[0-9]+" -o | grep -E "[0-9]+" -o)
read -a entity_array -d " " <<< "$entities"

echo "Requesting ${#entity_array[@]} resources"


if [ "$endWithIndex" = "" ]; then
  endWithIndex=${#entity_array[@]}
fi

for i in $(seq $startWithIndex $endWithIndex);
do
    id=${entity_array[$i]}
    echo -n "Request resource $id ..."

    request=$(curl -silent -L -H "Accept: text/turtle" -H "Connection: keep-alive" "$BASEURL/$id")
    result=$(get_result_from_request "$request")

    echo "$result" >> "$output"

    echo " done with $i."
done

exit 0
